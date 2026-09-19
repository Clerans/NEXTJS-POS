import { PoolClient } from 'pg';
import { pool } from '../../../config/db.js';
import {
  AdjustStockDto,
  StockLevelResponseDto,
  InventoryLedgerEntryDto,
  StockInRequestDto,
  StockOutRequestDto,
  StockTransferRequestDto,
  CreateStockAdjustmentDto,
  StockAlertItemDto,
} from '../dto/inventory.dto.js';
import { UnprocessableEntityError } from '../../../common/errors/app-error.js';

export class InventoryRepository {
  async getStockLevels(branchId?: number): Promise<StockLevelResponseDto[]> {
    let query = `
      SELECT s.product_id, p.name as product_name, p.sku as sku_or_code, c.name as category_name,
             w.name as branch_name, s.current_stock, s.reorder_level, s.status, s.raw_material_id, p.is_active
      FROM inventory_stock s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN warehouses w ON s.branch_id = w.id
    `;
    const params: any[] = [];
    if (branchId) {
      query += ` WHERE s.branch_id = $1`;
      params.push(branchId);
    }
    query += ` ORDER BY p.name ASC`;

    const result = await pool.query(query, params);

    return result.rows.map((row: any) => ({
      productId: row.product_id ? parseInt(row.product_id, 10) : undefined,
      productName: row.product_name || `Raw Material #${row.raw_material_id}`,
      category: row.category_name || 'General',
      skuOrCode: row.sku_or_code || `RAW-${row.raw_material_id}`,
      currentStock: parseFloat(row.current_stock),
      reorderLevel: parseFloat(row.reorder_level),
      branch: row.branch_name || 'Colombo Main Outlet',
      branchName: row.branch_name || 'Colombo Main Outlet',
      status: row.status as 'NORMAL' | 'LOW' | 'OUT_OF_STOCK',
      prodStatus: row.is_active === false ? 'Inactive' : 'Active',
      rawMaterialId: row.raw_material_id ? parseInt(row.raw_material_id, 10) : undefined,
    }));
  }

  async getLedgerEntries(): Promise<InventoryLedgerEntryDto[]> {
    const result = await pool.query(
      `SELECT id, branch_id, product_id, raw_material_id, batch_id, transaction_type,
              reference_id, quantity_change, balance_after, unit_cost, created_by, created_at
       FROM inventory_ledger
       ORDER BY id DESC
       LIMIT 100`
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      branchId: parseInt(row.branch_id, 10),
      productId: row.product_id ? parseInt(row.product_id, 10) : undefined,
      rawMaterialId: row.raw_material_id ? parseInt(row.raw_material_id, 10) : undefined,
      batchId: row.batch_id ? parseInt(row.batch_id, 10) : undefined,
      transactionType: row.transaction_type,
      referenceId: row.reference_id,
      quantityChange: parseFloat(row.quantity_change),
      balanceAfter: parseFloat(row.balance_after),
      unitCost: parseFloat(row.unit_cost || 0),
      createdBy: row.created_by ? parseInt(row.created_by, 10) : 1,
      createdAt: row.created_at,
    }));
  }

  /**
   * Transactional Stock In
   */
  async recordStockInTx(client: PoolClient, dto: StockInRequestDto): Promise<InventoryLedgerEntryDto> {
    const branchId = dto.branchId || 1;
    let currentBalance = 0;

    if (dto.productId) {
      // Row locking using FOR UPDATE
      const stockRes = await client.query(
        'SELECT current_stock FROM inventory_stock WHERE branch_id = $1 AND product_id = $2 FOR UPDATE',
        [branchId, dto.productId]
      );

      if (stockRes.rows.length > 0) {
        currentBalance = parseFloat(stockRes.rows[0].current_stock);
      }
    } else if (dto.rawMaterialId && dto.warehouseId) {
      const rmRes = await client.query(
        'SELECT current_stock FROM raw_material_inventory WHERE warehouse_id = $1 AND raw_material_id = $2 FOR UPDATE',
        [dto.warehouseId, dto.rawMaterialId]
      );
      if (rmRes.rows.length > 0) {
        currentBalance = parseFloat(rmRes.rows[0].current_stock);
      }
    }

    const newBalance = currentBalance + dto.quantity;
    const newStatus = newBalance === 0 ? 'OUT_OF_STOCK' : newBalance <= 10 ? 'LOW' : 'NORMAL';

    // Insert Ledger
    const ledgerRes = await client.query(
      `INSERT INTO inventory_ledger 
        (branch_id, product_id, raw_material_id, batch_id, transaction_type, reference_id, quantity_change, balance_after, unit_cost, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, created_at`,
      [
        branchId,
        dto.productId || null,
        dto.rawMaterialId || null,
        dto.batchId || null,
        dto.transactionType,
        dto.referenceId,
        dto.quantity,
        newBalance,
        dto.unitCost || 0,
        dto.userId,
      ]
    );

    // Update Stock Table
    if (dto.productId) {
      await client.query(
        `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
         VALUES ($1, $2, $3, 10, $4)
         ON CONFLICT (branch_id, product_id) DO UPDATE SET
           current_stock = inventory_stock.current_stock + EXCLUDED.current_stock,
           status = $4,
           updated_at = CURRENT_TIMESTAMP`,
        [branchId, dto.productId, dto.quantity, newStatus]
      );
    } else if (dto.rawMaterialId && dto.warehouseId) {
      await client.query(
        `INSERT INTO raw_material_inventory (warehouse_id, raw_material_id, current_stock, reorder_level)
         VALUES ($1, $2, $3, 10)
         ON CONFLICT (warehouse_id, raw_material_id) DO UPDATE SET
           current_stock = raw_material_inventory.current_stock + EXCLUDED.current_stock,
           updated_at = CURRENT_TIMESTAMP`,
        [dto.warehouseId, dto.rawMaterialId, dto.quantity]
      );
    }

    return {
      id: parseInt(ledgerRes.rows[0].id, 10),
      branchId,
      productId: dto.productId,
      rawMaterialId: dto.rawMaterialId,
      batchId: dto.batchId,
      transactionType: dto.transactionType,
      referenceId: dto.referenceId,
      quantityChange: dto.quantity,
      balanceAfter: newBalance,
      unitCost: dto.unitCost || 0,
      createdBy: dto.userId,
      createdAt: ledgerRes.rows[0].created_at,
    };
  }

  /**
   * Transactional Stock Out (with Recipe Support & Negative Stock Checks)
   */
  async recordStockOutTx(client: PoolClient, dto: StockOutRequestDto): Promise<InventoryLedgerEntryDto> {
    const branchId = dto.branchId || 1;

    // Check if Product is Recipe-Based
    if (dto.productId) {
      const prodRes = await client.query('SELECT is_recipe_based, name FROM products WHERE id = $1', [dto.productId]);
      if (prodRes.rows.length > 0 && prodRes.rows[0].is_recipe_based) {
        // Handle Recipe Raw Material Deductions
        const recipeRes = await client.query(
          `SELECT r.id as recipe_id, ri.raw_material_id, ri.quantity, rm.name as raw_material_name
           FROM recipes r
           JOIN recipe_items ri ON r.id = ri.recipe_id
           JOIN raw_materials rm ON ri.raw_material_id = rm.id
           WHERE r.product_id = $1`,
          [dto.productId]
        );

        for (const item of recipeRes.rows) {
          const requiredQty = parseFloat(item.quantity) * dto.quantity;
          const warehouseId = dto.warehouseId || 1;

          // Lock raw material stock
          const rmStock = await client.query(
            'SELECT current_stock FROM raw_material_inventory WHERE warehouse_id = $1 AND raw_material_id = $2 FOR UPDATE',
            [warehouseId, item.raw_material_id]
          );

          const avail = rmStock.rows.length > 0 ? parseFloat(rmStock.rows[0].current_stock) : 0;
          if (avail < requiredQty) {
            throw new UnprocessableEntityError(
              `Insufficient raw material: ${item.raw_material_name}. Required ${requiredQty}, available ${avail}`
            );
          }

          const newRmBalance = avail - requiredQty;

          // Deduct Raw Material Stock
          await client.query(
            `UPDATE raw_material_inventory SET current_stock = $1, updated_at = CURRENT_TIMESTAMP WHERE warehouse_id = $2 AND raw_material_id = $3`,
            [newRmBalance, warehouseId, item.raw_material_id]
          );

          // Add Ledger Entry for Raw Material Consumption
          await client.query(
            `INSERT INTO inventory_ledger 
              (branch_id, product_id, raw_material_id, transaction_type, reference_id, quantity_change, balance_after, unit_cost, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8)`,
            [branchId, dto.productId, item.raw_material_id, 'POS_RECIPE_CONSUMPTION', dto.referenceId, -requiredQty, newRmBalance, dto.userId]
          );
        }
      }
    }

    // Direct Product/Material Stock Out
    let currentBalance = 0;
    if (dto.productId) {
      const stockRes = await client.query(
        'SELECT current_stock FROM inventory_stock WHERE branch_id = $1 AND product_id = $2 FOR UPDATE',
        [branchId, dto.productId]
      );

      currentBalance = stockRes.rows.length > 0 ? parseFloat(stockRes.rows[0].current_stock) : 0;
      if (currentBalance < dto.quantity) {
        throw new UnprocessableEntityError(
          `Insufficient stock balance for Product #${dto.productId}. Attempted to reduce ${dto.quantity}, available ${currentBalance}`
        );
      }
    } else if (dto.rawMaterialId && dto.warehouseId) {
      const rmRes = await client.query(
        'SELECT current_stock FROM raw_material_inventory WHERE warehouse_id = $1 AND raw_material_id = $2 FOR UPDATE',
        [dto.warehouseId, dto.rawMaterialId]
      );

      currentBalance = rmRes.rows.length > 0 ? parseFloat(rmRes.rows[0].current_stock) : 0;
      if (currentBalance < dto.quantity) {
        throw new UnprocessableEntityError(
          `Insufficient stock balance for Raw Material #${dto.rawMaterialId}. Attempted to reduce ${dto.quantity}, available ${currentBalance}`
        );
      }
    }

    const newBalance = currentBalance - dto.quantity;
    const newStatus = newBalance === 0 ? 'OUT_OF_STOCK' : newBalance <= 10 ? 'LOW' : 'NORMAL';

    const ledgerRes = await client.query(
      `INSERT INTO inventory_ledger 
        (branch_id, product_id, raw_material_id, batch_id, transaction_type, reference_id, quantity_change, balance_after, unit_cost, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9)
       RETURNING id, created_at`,
      [
        branchId,
        dto.productId || null,
        dto.rawMaterialId || null,
        dto.batchId || null,
        dto.transactionType,
        dto.referenceId,
        -dto.quantity,
        newBalance,
        dto.userId,
      ]
    );

    if (dto.productId) {
      await client.query(
        `UPDATE inventory_stock SET current_stock = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE branch_id = $3 AND product_id = $4`,
        [newBalance, newStatus, branchId, dto.productId]
      );
    } else if (dto.rawMaterialId && dto.warehouseId) {
      await client.query(
        `UPDATE raw_material_inventory SET current_stock = $1, updated_at = CURRENT_TIMESTAMP WHERE warehouse_id = $2 AND raw_material_id = $3`,
        [newBalance, dto.warehouseId, dto.rawMaterialId]
      );
    }

    return {
      id: parseInt(ledgerRes.rows[0].id, 10),
      branchId,
      productId: dto.productId,
      rawMaterialId: dto.rawMaterialId,
      batchId: dto.batchId,
      transactionType: dto.transactionType,
      referenceId: dto.referenceId,
      quantityChange: -dto.quantity,
      balanceAfter: newBalance,
      unitCost: 0,
      createdBy: dto.userId,
      createdAt: ledgerRes.rows[0].created_at,
    };
  }

  async getStockAlerts(branchId?: number): Promise<StockAlertItemDto[]> {
    let query = `
      SELECT 'PRODUCT' as type, p.id, p.sku as code, p.name, s.current_stock, s.reorder_level, s.status
      FROM inventory_stock s
      JOIN products p ON s.product_id = p.id
      WHERE s.current_stock <= s.reorder_level
    `;
    const params: any[] = [];
    if (branchId) {
      query += ` AND s.branch_id = $1`;
      params.push(branchId);
    }

    const result = await pool.query(query, params);

    return result.rows.map((row: any) => {
      const stock = parseFloat(row.current_stock);
      return {
        type: 'PRODUCT',
        id: parseInt(row.id, 10),
        code: row.code,
        name: row.name,
        currentStock: stock,
        reorderLevel: parseFloat(row.reorder_level),
        alertType: stock <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
      };
    });
  }

  async addLedgerEntry(dto: AdjustStockDto, userId: number, currentBalance: number): Promise<InventoryLedgerEntryDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      if (dto.quantityChange >= 0) {
        const result = await this.recordStockInTx(client, {
          branchId: dto.branchId,
          productId: dto.productId,
          rawMaterialId: dto.rawMaterialId,
          batchId: dto.batchId,
          quantity: dto.quantityChange,
          unitCost: dto.unitCost,
          transactionType: 'STOCK_ADJUSTMENT_IN',
          referenceId: dto.referenceId || 'ADJUSTMENT',
          userId,
        });
        await client.query('COMMIT');
        return result;
      } else {
        const result = await this.recordStockOutTx(client, {
          branchId: dto.branchId,
          productId: dto.productId,
          rawMaterialId: dto.rawMaterialId,
          batchId: dto.batchId,
          quantity: Math.abs(dto.quantityChange),
          transactionType: 'STOCK_ADJUSTMENT_OUT',
          referenceId: dto.referenceId || 'ADJUSTMENT',
          userId,
        });
        await client.query('COMMIT');
        return result;
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async toggleProductStatus(productId: number): Promise<boolean> {
    const res = await pool.query('UPDATE products SET is_active = NOT is_active WHERE id = $1 RETURNING is_active', [productId]);
    return res.rows.length > 0 ? res.rows[0].is_active : true;
  }

  async deleteInventoryItem(productId: number): Promise<boolean> {
    const res = await pool.query('DELETE FROM inventory_stock WHERE product_id = $1', [productId]);
    return (res.rowCount ?? 0) > 0;
  }
}
