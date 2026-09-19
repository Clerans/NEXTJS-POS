import { pool } from '../../../config/db.js';
import { InventoryRepository } from '../repository/inventory.repository.js';
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

export class InventoryService {
  private inventoryRepository: InventoryRepository;

  constructor() {
    this.inventoryRepository = new InventoryRepository();
  }

  async getStockLevels(branchId?: number): Promise<StockLevelResponseDto[]> {
    return await this.inventoryRepository.getStockLevels(branchId);
  }

  async getLedgerEntries(): Promise<InventoryLedgerEntryDto[]> {
    return await this.inventoryRepository.getLedgerEntries();
  }

  async recordStockIn(dto: StockInRequestDto): Promise<InventoryLedgerEntryDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await this.inventoryRepository.recordStockInTx(client, dto);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async recordStockOut(dto: StockOutRequestDto): Promise<InventoryLedgerEntryDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await this.inventoryRepository.recordStockOutTx(client, dto);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async recordStockTransfer(dto: StockTransferRequestDto): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create Stock Transfer master record
      const transferRes = await client.query(
        `INSERT INTO stock_transfers (transfer_no, source_warehouse_id, destination_warehouse_id, status)
         VALUES ($1, $2, $3, 'COMPLETED')
         RETURNING id`,
        [dto.transferNo, dto.sourceWarehouseId, dto.destinationWarehouseId]
      );
      const transferId = transferRes.rows[0].id;

      for (const item of dto.items) {
        // Record Item transfer
        await client.query(
          `INSERT INTO transfer_items (transfer_id, product_id, quantity) VALUES ($1, $2, $3)`,
          [transferId, item.productId || null, item.quantity]
        );

        // Deduct from Source Warehouse
        await this.inventoryRepository.recordStockOutTx(client, {
          branchId: dto.sourceWarehouseId,
          warehouseId: dto.sourceWarehouseId,
          productId: item.productId,
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          transactionType: 'TRANSFER_OUT',
          referenceId: dto.transferNo,
          userId: dto.userId,
        });

        // Add to Destination Warehouse
        await this.inventoryRepository.recordStockInTx(client, {
          branchId: dto.destinationWarehouseId,
          warehouseId: dto.destinationWarehouseId,
          productId: item.productId,
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          transactionType: 'TRANSFER_IN',
          referenceId: dto.transferNo,
          userId: dto.userId,
        });
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async createStockAdjustment(dto: CreateStockAdjustmentDto): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const adjNo = `ADJ-${Date.now()}`;
      const adjRes = await client.query(
        `INSERT INTO stock_adjustments (adjustment_no, branch_id, warehouse_id, adjusted_by, reason, status)
         VALUES ($1, $2, $3, $4, $5, 'COMPLETED')
         RETURNING id`,
        [adjNo, dto.branchId, dto.warehouseId || null, dto.userId, dto.reason]
      );
      const adjId = adjRes.rows[0].id;

      for (const item of dto.items) {
        let prevQty = 0;
        if (item.productId) {
          const stockRes = await client.query(
            'SELECT current_stock FROM inventory_stock WHERE branch_id = $1 AND product_id = $2 FOR UPDATE',
            [dto.branchId, item.productId]
          );
          if (stockRes.rows.length > 0) prevQty = parseFloat(stockRes.rows[0].current_stock);
        }

        const delta = item.newQuantity - prevQty;

        await client.query(
          `INSERT INTO stock_adjustment_items 
            (adjustment_id, product_id, raw_material_id, previous_quantity, new_quantity, adjustment_quantity, unit_cost)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [adjId, item.productId || null, item.rawMaterialId || null, prevQty, item.newQuantity, delta, item.unitCost || 0]
        );

        if (delta > 0) {
          await this.inventoryRepository.recordStockInTx(client, {
            branchId: dto.branchId,
            warehouseId: dto.warehouseId,
            productId: item.productId,
            rawMaterialId: item.rawMaterialId,
            quantity: delta,
            unitCost: item.unitCost,
            transactionType: 'STOCK_ADJUSTMENT_IN',
            referenceId: adjNo,
            userId: dto.userId,
          });
        } else if (delta < 0) {
          await this.inventoryRepository.recordStockOutTx(client, {
            branchId: dto.branchId,
            warehouseId: dto.warehouseId,
            productId: item.productId,
            rawMaterialId: item.rawMaterialId,
            quantity: Math.abs(delta),
            transactionType: 'STOCK_ADJUSTMENT_OUT',
            referenceId: adjNo,
            userId: dto.userId,
          });
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getStockAlerts(branchId?: number): Promise<StockAlertItemDto[]> {
    return await this.inventoryRepository.getStockAlerts(branchId);
  }

  async adjustStock(dto: AdjustStockDto, userId: number): Promise<InventoryLedgerEntryDto> {
    const stockLevels = await this.inventoryRepository.getStockLevels(dto.branchId);
    let currentStock = 0;

    if (dto.productId) {
      const match = stockLevels.find((s) => s.productId === dto.productId);
      if (match) currentStock = match.currentStock;
    }

    return await this.inventoryRepository.addLedgerEntry(dto, userId, currentStock);
  }

  async toggleProductStatus(productId: number): Promise<boolean> {
    return await this.inventoryRepository.toggleProductStatus(productId);
  }

  async deleteInventoryItem(productId: number): Promise<boolean> {
    return await this.inventoryRepository.deleteInventoryItem(productId);
  }
}
