import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { InventoryService } from '../service/inventory.service.js';
import { pool, initDatabase } from '../../../config/db.js';
import { UnprocessableEntityError } from '../../../common/errors/app-error.js';

describe('Centralized Inventory Engine Core', () => {
  let inventoryService: InventoryService;

  beforeEach(async () => {
    await initDatabase();
    inventoryService = new InventoryService();

    // Reset test stock records
    await pool.query(
      `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
       VALUES (1, 1, 100, 10, 'NORMAL'), (1, 2, 100, 10, 'NORMAL')
       ON CONFLICT (branch_id, product_id) DO UPDATE SET current_stock = 100, status = 'NORMAL'`
    );

    await pool.query('DELETE FROM raw_material_inventory WHERE raw_material_id IN (1, 2)');
    await pool.query(
      `INSERT INTO raw_material_inventory (warehouse_id, raw_material_id, current_stock, reorder_level)
       VALUES (1, 1, 50.00, 10.00), (2, 1, 0.00, 10.00), (1, 2, 50.00, 10.00)`
    );
  });

  it('should process Stock In for purchases and record ledger entry', async () => {
    const entry = await inventoryService.recordStockIn({
      branchId: 1,
      productId: 1,
      quantity: 25,
      transactionType: 'PURCHASE',
      referenceId: 'PO-TEST-001',
      userId: 1,
    });

    assert.ok(entry);
    assert.strictEqual(entry.quantityChange, 25);
    assert.strictEqual(entry.balanceAfter, 125);
  });

  it('should process Stock Out for sales and record ledger entry', async () => {
    const entry = await inventoryService.recordStockOut({
      branchId: 1,
      productId: 1,
      quantity: 10,
      transactionType: 'POS_SALE',
      referenceId: 'INV-TEST-001',
      userId: 1,
    });

    assert.ok(entry);
    assert.strictEqual(entry.quantityChange, -10);
    assert.strictEqual(entry.balanceAfter, 90);
  });

  it('should reject Stock Out when stock is insufficient with UnprocessableEntityError', async () => {
    await assert.rejects(
      async () => {
        await inventoryService.recordStockOut({
          branchId: 1,
          productId: 1,
          quantity: 500, // Exceeds 100
          transactionType: 'POS_SALE',
          referenceId: 'INV-FAIL-001',
          userId: 1,
        });
      },
      (err: any) => err instanceof UnprocessableEntityError
    );
  });

  it('should process recipe-based stock out by deducting raw materials', async () => {
    // Product #2 (Cappuccino) is recipe based (18g coffee = 0.018kg, 180ml milk = 0.180L)
    const entry = await inventoryService.recordStockOut({
      branchId: 1,
      warehouseId: 1,
      productId: 2,
      quantity: 2, // 2 cappuccinos = 0.036kg coffee, 0.360L milk
      transactionType: 'POS_SALE',
      referenceId: 'RECIPE-TEST-001',
      userId: 1,
    });

    assert.ok(entry);

    // Verify raw material #1 (coffee) balance reduced from 50.00
    const rmRes = await pool.query('SELECT current_stock FROM raw_material_inventory WHERE warehouse_id = 1 AND raw_material_id = 1');
    const newStock = parseFloat(rmRes.rows[0].current_stock);
    assert.ok(newStock < 50.00);
    assert.ok(Math.abs(newStock - 49.964) < 0.01);
  });

  it('should execute stock transfer between two warehouses transactionally', async () => {
    await inventoryService.recordStockTransfer({
      sourceWarehouseId: 1,
      destinationWarehouseId: 2,
      transferNo: `TRF-${Date.now()}`,
      userId: 1,
      items: [{ rawMaterialId: 1, quantity: 5.0 }],
    });

    const srcRm = await pool.query('SELECT current_stock FROM raw_material_inventory WHERE warehouse_id = 1 AND raw_material_id = 1');
    const dstRm = await pool.query('SELECT current_stock FROM raw_material_inventory WHERE warehouse_id = 2 AND raw_material_id = 1');

    assert.ok(parseFloat(srcRm.rows[0].current_stock) < 50.0);
    assert.strictEqual(parseFloat(dstRm.rows[0].current_stock), 5.0);
  });

  it('should process stock adjustment and update stock levels', async () => {
    await inventoryService.createStockAdjustment({
      branchId: 1,
      warehouseId: 1,
      reason: 'Physical count variance audit',
      userId: 1,
      items: [{ productId: 1, newQuantity: 80 }],
    });

    const stockRes = await pool.query('SELECT current_stock FROM inventory_stock WHERE branch_id = 1 AND product_id = 1');
    assert.strictEqual(parseFloat(stockRes.rows[0].current_stock), 80);
  });

  it('should retrieve stock alerts for low stock and out-of-stock items', async () => {
    // Set product #3 current stock to 0
    await pool.query(
      `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
       VALUES (1, 3, 0, 10, 'OUT_OF_STOCK')
       ON CONFLICT (branch_id, product_id) DO UPDATE SET current_stock = 0, status = 'OUT_OF_STOCK'`
    );

    const alerts = await inventoryService.getStockAlerts(1);
    assert.ok(alerts.length >= 1);
    const zeroItem = alerts.find((a) => a.id === 3);
    assert.ok(zeroItem);
    assert.strictEqual(zeroItem.alertType, 'OUT_OF_STOCK');
  });
});
