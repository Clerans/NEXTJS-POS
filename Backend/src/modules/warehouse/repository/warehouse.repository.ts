import { pool } from '../../../config/db.js';
import {
  CreateTransferDto,
  TransferResponseDto,
  CreateProductionDto,
  ProductionResponseDto,
  ProductionItemResponseDto,
} from '../dto/warehouse.dto.js';
import { InventoryRepository } from '../../inventory/repository/inventory.repository.js';
import { UnprocessableEntityError, NotFoundError } from '../../../common/errors/app-error.js';

export class WarehouseRepository {
  private inventoryRepository: InventoryRepository;

  constructor() {
    this.inventoryRepository = new InventoryRepository();
  }

  async findAllTransfers(): Promise<TransferResponseDto[]> {
    const result = await pool.query(
      `SELECT t.id, t.transfer_no, t.status, t.created_at,
              sw.id as sw_id, sw.name as sw_name,
              dw.id as dw_id, dw.name as dw_name,
              COUNT(ti.id) as items_count
       FROM stock_transfers t
       LEFT JOIN warehouses sw ON t.source_warehouse_id = sw.id
       LEFT JOIN warehouses dw ON t.destination_warehouse_id = dw.id
       LEFT JOIN transfer_items ti ON t.id = ti.transfer_id
       GROUP BY t.id, sw.id, dw.id
       ORDER BY t.id DESC`
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      transferNo: row.transfer_no,
      sourceWarehouse: { id: parseInt(row.sw_id, 10) || 1, name: row.sw_name || 'Source Warehouse' },
      destinationWarehouse: { id: parseInt(row.dw_id, 10) || 2, name: row.dw_name || 'Destination Warehouse' },
      status: row.status,
      itemsCount: parseInt(row.items_count, 10) || 0,
      createdAt: row.created_at,
    }));
  }

  async findTransferById(id: number): Promise<TransferResponseDto | null> {
    const transfers = await this.findAllTransfers();
    return transfers.find((t) => t.id === id) || null;
  }

  async createTransfer(dto: CreateTransferDto, transferNo: string, userId: number = 1): Promise<TransferResponseDto> {
    if (dto.sourceWarehouseId === dto.destinationWarehouseId) {
      throw new UnprocessableEntityError('Source and destination warehouses cannot be identical');
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const transferRes = await client.query(
        `INSERT INTO stock_transfers (transfer_no, source_warehouse_id, destination_warehouse_id, status)
         VALUES ($1, $2, $3, 'IN_TRANSIT')
         RETURNING id, created_at`,
        [transferNo, dto.sourceWarehouseId, dto.destinationWarehouseId]
      );

      const transferId = parseInt(transferRes.rows[0].id, 10);

      for (const item of dto.items) {
        await client.query(
          `INSERT INTO transfer_items (transfer_id, product_id, raw_material_id, quantity)
           VALUES ($1, $2, $3, $4)`,
          [transferId, item.productId || null, item.rawMaterialId || null, item.quantity]
        );

        // Deduct stock from Source Warehouse (holds in-transit state)
        await this.inventoryRepository.recordStockOutTx(client, {
          branchId: dto.sourceWarehouseId,
          warehouseId: dto.sourceWarehouseId,
          productId: item.productId,
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          transactionType: 'TRANSFER_OUT',
          referenceId: transferNo,
          userId,
        });
      }

      await client.query('COMMIT');

      const sw = await pool.query('SELECT name FROM warehouses WHERE id = $1', [dto.sourceWarehouseId]);
      const dw = await pool.query('SELECT name FROM warehouses WHERE id = $1', [dto.destinationWarehouseId]);

      return {
        id: transferId,
        transferNo,
        sourceWarehouse: { id: dto.sourceWarehouseId, name: sw.rows[0]?.name || 'Source Warehouse' },
        destinationWarehouse: { id: dto.destinationWarehouseId, name: dw.rows[0]?.name || 'Destination Warehouse' },
        status: 'IN_TRANSIT',
        itemsCount: dto.items.length,
        createdAt: transferRes.rows[0].created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async completeTransfer(id: number, userId: number = 1): Promise<TransferResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const transferRes = await client.query(
        `SELECT id, transfer_no, source_warehouse_id, destination_warehouse_id, status
         FROM stock_transfers WHERE id = $1 FOR UPDATE`,
        [id]
      );

      if (transferRes.rows.length === 0) {
        throw new NotFoundError(`Stock transfer #${id} not found`);
      }

      const transfer = transferRes.rows[0];
      if (transfer.status === 'COMPLETED' || transfer.status === 'CANCELLED') {
        throw new UnprocessableEntityError(
          `Stock transfer #${id} cannot be completed because its status is already ${transfer.status}`
        );
      }

      const itemsRes = await client.query(
        `SELECT product_id, raw_material_id, quantity FROM transfer_items WHERE transfer_id = $1`,
        [id]
      );

      const destWarehouseId = parseInt(transfer.destination_warehouse_id, 10);

      for (const item of itemsRes.rows) {
        await this.inventoryRepository.recordStockInTx(client, {
          branchId: destWarehouseId,
          warehouseId: destWarehouseId,
          productId: item.product_id ? parseInt(item.product_id, 10) : undefined,
          rawMaterialId: item.raw_material_id ? parseInt(item.raw_material_id, 10) : undefined,
          quantity: parseFloat(item.quantity),
          transactionType: 'TRANSFER_IN',
          referenceId: transfer.transfer_no,
          userId,
        });
      }

      await client.query(
        `UPDATE stock_transfers SET status = 'COMPLETED' WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');

      const updated = await this.findTransferById(id);
      if (!updated) {
        throw new NotFoundError(`Stock transfer #${id} not found after completion`);
      }
      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async cancelTransfer(id: number, userId: number = 1): Promise<TransferResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const transferRes = await client.query(
        `SELECT id, transfer_no, source_warehouse_id, destination_warehouse_id, status
         FROM stock_transfers WHERE id = $1 FOR UPDATE`,
        [id]
      );

      if (transferRes.rows.length === 0) {
        throw new NotFoundError(`Stock transfer #${id} not found`);
      }

      const transfer = transferRes.rows[0];
      if (transfer.status === 'COMPLETED' || transfer.status === 'CANCELLED') {
        throw new UnprocessableEntityError(
          `Stock transfer #${id} cannot be cancelled because its status is already ${transfer.status}`
        );
      }

      const itemsRes = await client.query(
        `SELECT product_id, raw_material_id, quantity FROM transfer_items WHERE transfer_id = $1`,
        [id]
      );

      const sourceWarehouseId = parseInt(transfer.source_warehouse_id, 10);

      // Return stock back to source warehouse
      for (const item of itemsRes.rows) {
        await this.inventoryRepository.recordStockInTx(client, {
          branchId: sourceWarehouseId,
          warehouseId: sourceWarehouseId,
          productId: item.product_id ? parseInt(item.product_id, 10) : undefined,
          rawMaterialId: item.raw_material_id ? parseInt(item.raw_material_id, 10) : undefined,
          quantity: parseFloat(item.quantity),
          transactionType: 'TRANSFER_CANCEL_RETURN',
          referenceId: transfer.transfer_no,
          userId,
        });
      }

      await client.query(
        `UPDATE stock_transfers SET status = 'CANCELLED' WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');

      const updated = await this.findTransferById(id);
      if (!updated) {
        throw new NotFoundError(`Stock transfer #${id} not found after cancellation`);
      }
      return updated;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateTransferStatus(id: number, status: 'DISPATCHED' | 'RECEIVED' | 'CANCELLED' | 'IN_TRANSIT' | 'COMPLETED'): Promise<boolean> {
    await pool.query('UPDATE stock_transfers SET status = $1 WHERE id = $2', [status, id]);
    return true;
  }

  // --- WAREHOUSE PRODUCTIONS EXTENSIONS ---

  async findAllProductions(): Promise<ProductionResponseDto[]> {
    const result = await pool.query(
      `SELECT p.id, p.production_no, p.product_id, prod.name as product_name,
              p.warehouse_id, w.name as warehouse_name,
              p.recipe_id, p.quantity, p.status, p.created_by, p.created_at, p.completed_at
       FROM warehouse_productions p
       LEFT JOIN products prod ON p.product_id = prod.id
       LEFT JOIN warehouses w ON p.warehouse_id = w.id
       ORDER BY p.id DESC`
    );

    const productions: ProductionResponseDto[] = [];
    for (const row of result.rows) {
      const itemsRes = await pool.query(
        `SELECT pi.id, pi.raw_material_id, rm.name as raw_material_name,
                pi.quantity_consumed, pi.unit_id, u.abbreviation as unit_abbr
         FROM warehouse_production_items pi
         JOIN raw_materials rm ON pi.raw_material_id = rm.id
         LEFT JOIN units u ON pi.unit_id = u.id
         WHERE pi.production_id = $1`,
        [row.id]
      );

      const items: ProductionItemResponseDto[] = itemsRes.rows.map((itemRow: any) => ({
        id: parseInt(itemRow.id, 10),
        rawMaterialId: parseInt(itemRow.raw_material_id, 10),
        rawMaterialName: itemRow.raw_material_name || null,
        quantityConsumed: parseFloat(itemRow.quantity_consumed),
        unitId: itemRow.unit_id ? parseInt(itemRow.unit_id, 10) : null,
        unitAbbr: itemRow.unit_abbr || null,
      }));

      productions.push({
        id: parseInt(row.id, 10),
        productionNo: row.production_no,
        productId: parseInt(row.product_id, 10),
        productName: row.product_name || null,
        warehouseId: parseInt(row.warehouse_id, 10),
        warehouseName: row.warehouse_name || null,
        recipeId: parseInt(row.recipe_id, 10),
        quantity: parseFloat(row.quantity),
        status: row.status,
        createdBy: row.created_by ? parseInt(row.created_by, 10) : null,
        createdAt: row.created_at,
        completedAt: row.completed_at || null,
        items,
      });
    }

    return productions;
  }

  async findProductionById(id: number): Promise<ProductionResponseDto | null> {
    const list = await this.findAllProductions();
    return list.find((p) => p.id === id) || null;
  }

  async createProduction(dto: CreateProductionDto, userId: number = 1): Promise<ProductionResponseDto> {
    // 1. Validate Product exists and is active
    const prodRes = await pool.query(`SELECT id, name, is_active FROM products WHERE id = $1`, [dto.productId]);
    if (prodRes.rows.length === 0) {
      throw new NotFoundError(`Product #${dto.productId} not found`);
    }
    if (prodRes.rows[0].is_active === false) {
      throw new UnprocessableEntityError(`Product '${prodRes.rows[0].name}' is inactive`);
    }

    // 2. Validate Warehouse exists
    const whRes = await pool.query(`SELECT id, name, branch_id FROM warehouses WHERE id = $1`, [dto.warehouseId]);
    if (whRes.rows.length === 0) {
      throw new NotFoundError(`Warehouse #${dto.warehouseId} not found`);
    }
    const branchId = whRes.rows[0].branch_id ? parseInt(whRes.rows[0].branch_id, 10) : dto.warehouseId;

    // 3. Load active recipe for product
    const recipeRes = await pool.query(
      `SELECT id, name, yield_quantity, is_active FROM recipes WHERE product_id = $1 AND is_active = TRUE`,
      [dto.productId]
    );
    if (recipeRes.rows.length === 0) {
      throw new UnprocessableEntityError(`No active recipe found for product #${dto.productId}`);
    }
    const recipe = recipeRes.rows[0];
    const yieldQuantity = parseFloat(recipe.yield_quantity || '1.0');
    if (yieldQuantity <= 0) {
      throw new UnprocessableEntityError(`Invalid recipe yield quantity (${yieldQuantity}) for recipe #${recipe.id}`);
    }

    // 4. Load recipe items
    const itemsRes = await pool.query(
      `SELECT ri.raw_material_id, ri.quantity, ri.unit_id, rm.name as raw_material_name
       FROM recipe_items ri
       JOIN raw_materials rm ON ri.raw_material_id = rm.id
       WHERE ri.recipe_id = $1`,
      [recipe.id]
    );

    if (itemsRes.rows.length === 0) {
      throw new UnprocessableEntityError(`Recipe #${recipe.id} has no ingredient items`);
    }

    // Yield-scaling factor: (production_qty / recipe.yield_quantity)
    const scalingFactor = dto.quantity / yieldQuantity;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 5. Validate & Lock raw material inventory
      for (const item of itemsRes.rows) {
        const requiredQty = parseFloat(item.quantity) * scalingFactor;
        const rmStockRes = await client.query(
          `SELECT current_stock FROM raw_material_inventory WHERE warehouse_id = $1 AND raw_material_id = $2 FOR UPDATE`,
          [dto.warehouseId, item.raw_material_id]
        );

        const currentStock = rmStockRes.rows.length > 0 ? parseFloat(rmStockRes.rows[0].current_stock) : 0;
        if (currentStock < requiredQty) {
          throw new UnprocessableEntityError(
            `Insufficient raw material stock: ${item.raw_material_name}. Required ${requiredQty.toFixed(4)}, available ${currentStock}`
          );
        }
      }

      // 6. Create production record
      const prodNo = `PRD-2026-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;
      const prodRecordRes = await client.query(
        `INSERT INTO warehouse_productions (production_no, product_id, warehouse_id, recipe_id, quantity, status, created_by, completed_at)
         VALUES ($1, $2, $3, $4, $5, 'COMPLETED', $6, CURRENT_TIMESTAMP)
         RETURNING id`,
        [prodNo, dto.productId, dto.warehouseId, recipe.id, dto.quantity, userId]
      );
      const productionId = parseInt(prodRecordRes.rows[0].id, 10);

      // 7. Deduct raw materials & record production items & ledger entries
      for (const item of itemsRes.rows) {
        const requiredQty = parseFloat(item.quantity) * scalingFactor;
        const rmId = parseInt(item.raw_material_id, 10);

        // Deduct raw material stock
        const updateRmRes = await client.query(
          `UPDATE raw_material_inventory
           SET current_stock = current_stock - $1, updated_at = CURRENT_TIMESTAMP
           WHERE warehouse_id = $2 AND raw_material_id = $3
           RETURNING current_stock`,
          [requiredQty, dto.warehouseId, rmId]
        );
        const newBalance = parseFloat(updateRmRes.rows[0].current_stock);

        // Insert item record
        await client.query(
          `INSERT INTO warehouse_production_items (production_id, raw_material_id, quantity_consumed, unit_id)
           VALUES ($1, $2, $3, $4)`,
          [productionId, rmId, requiredQty, item.unit_id ? parseInt(item.unit_id, 10) : null]
        );

        // Record ledger entry for raw material deduction
        await client.query(
          `INSERT INTO inventory_ledger (branch_id, raw_material_id, transaction_type, reference_id, quantity_change, balance_after, unit_cost, created_by)
           VALUES ($1, $2, 'PRODUCTION_CONSUMPTION', $3, $4, $5, 0, $6)`,
          [branchId, rmId, prodNo, -requiredQty, newBalance, userId]
        );
      }

      // 8. Increase finished product stock in inventory_stock
      const currentProdStockRes = await client.query(
        `SELECT current_stock FROM inventory_stock WHERE branch_id = $1 AND product_id = $2 FOR UPDATE`,
        [branchId, dto.productId]
      );
      const currentProdBalance = currentProdStockRes.rows.length > 0 ? parseFloat(currentProdStockRes.rows[0].current_stock) : 0;
      const newProdBalance = currentProdBalance + dto.quantity;
      const newStatus = newProdBalance === 0 ? 'OUT_OF_STOCK' : newProdBalance <= 10 ? 'LOW' : 'NORMAL';

      await client.query(
        `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
         VALUES ($1, $2, $3, 10, $4)
         ON CONFLICT (branch_id, product_id) DO UPDATE SET
           current_stock = inventory_stock.current_stock + EXCLUDED.current_stock,
           status = $4,
           updated_at = CURRENT_TIMESTAMP`,
        [branchId, dto.productId, dto.quantity, newStatus]
      );

      // Record ledger entry for finished product yield
      await client.query(
        `INSERT INTO inventory_ledger (branch_id, product_id, transaction_type, reference_id, quantity_change, balance_after, unit_cost, created_by)
         VALUES ($1, $2, 'PRODUCTION_YIELD', $3, $4, $5, 0, $6)`,
        [branchId, dto.productId, prodNo, dto.quantity, newProdBalance, userId]
      );

      await client.query('COMMIT');

      const created = await this.findProductionById(productionId);
      if (!created) {
        throw new Error(`Failed to retrieve production ID ${productionId}`);
      }
      return created;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
