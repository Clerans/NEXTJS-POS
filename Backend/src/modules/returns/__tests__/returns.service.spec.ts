import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ReturnService } from '../service/returns.service.js';
import { pool, initDatabase } from '../../../config/db.js';

describe('ReturnService Integration', () => {
  let returnService: ReturnService;
  let testOrderId: number;

  beforeEach(async () => {
    await initDatabase();
    returnService = new ReturnService();

    // Ensure raw material inventory stock exists for raw_material_id = 1
    await pool.query(
      `INSERT INTO raw_material_inventory (warehouse_id, raw_material_id, current_stock, reorder_level)
       VALUES (1, 1, 100.00, 10.00)
       ON CONFLICT (warehouse_id, raw_material_id) DO UPDATE SET current_stock = 100.00`
    );

    // Create a real completed order for customer return testing
    const orderRes = await pool.query(
      `INSERT INTO pos_orders (order_no, branch_id, customer_id, total_amount, subtotal, status)
       VALUES ($1, 1, 1, 900.00, 900.00, 'COMPLETED')
       RETURNING id`,
      [`ORD-RET-${Date.now()}`]
    );
    testOrderId = parseInt(orderRes.rows[0].id, 10);

    await pool.query(
      `INSERT INTO pos_order_items (order_id, product_id, product_name, quantity, unit_price, subtotal)
       VALUES ($1, 1, 'Espresso Regular', 2, 450.00, 900.00)`,
      [testOrderId]
    );

    // Ensure product stock for product 1
    await pool.query(
      `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
       VALUES (1, 1, 50.00, 10.00, 'NORMAL')
       ON CONFLICT (branch_id, product_id) DO UPDATE SET current_stock = 50.00`
    );
  });

  it('should process customer return cleanly and calculate total refund', async () => {
    const result = await returnService.processCustomerReturn({
      orderId: testOrderId,
      branchId: 1,
      refundMethod: 'CASH',
      items: [
        { productId: 1, quantity: 2, unitPrice: 450, reason: 'Defective item' },
      ],
    });

    assert.ok(result);
    assert.strictEqual(result.totalRefundAmount, 900);
    assert.strictEqual(result.type, 'CUSTOMER_RETURN');
    assert.strictEqual(result.status, 'PROCESSED');
  });

  it('should process supplier debit return cleanly', async () => {
    const result = await returnService.processSupplierReturn({
      supplierId: 1,
      branchId: 1,
      items: [
        { rawMaterialId: 1, quantity: 5, unitCost: 1200, reason: 'Damaged packaging' },
      ],
    });

    assert.ok(result);
    assert.strictEqual(result.totalRefundAmount, 6000);
    assert.strictEqual(result.type, 'SUPPLIER_RETURN');
  });
});
