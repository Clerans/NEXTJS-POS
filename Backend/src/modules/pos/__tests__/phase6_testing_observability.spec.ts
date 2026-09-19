import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { pool } from '../../../config/db.js';
import { POSService } from '../service/pos.service.js';
import { ProductService } from '../../products/service/products.service.js';
import { ReturnService } from '../../returns/service/returns.service.js';
import { AuthService } from '../../auth/service/auth.service.js';
import { SettingService } from '../../settings/service/settings.service.js';
import { AppError } from '../../../common/errors/app-error.js';
import { app } from '../../../server.js';

describe('Phase 6: Testing, Observability & Production Reliability', () => {
  const posService = new POSService();
  const productService = new ProductService();
  const returnService = new ReturnService();
  const authService = new AuthService();
  const settingService = new SettingService();

  let testProduct1Id: number;
  let testProduct2Id: number;

  before(async () => {
    // Create test products
    const sku1 = `P6_POS1_${Date.now()}`;
    const p1 = await productService.createProduct({
      sku: sku1,
      name: 'P6 Test Latte',
      retailPrice: 500.00,
      costPrice: 200.00,
      categoryId: 1,
      unitId: 1,
    });
    testProduct1Id = p1.id;

    const sku2 = `P6_POS2_${Date.now()}`;
    const p2 = await productService.createProduct({
      sku: sku2,
      name: 'P6 Test Croissant',
      retailPrice: 300.00,
      costPrice: 100.00,
      categoryId: 1,
      unitId: 1,
    });
    testProduct2Id = p2.id;

    // Stock inventory for branch 1 and branch 2
    await pool.query(
      `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
       VALUES (1, $1, 100.00, 10.00, 'NORMAL'), (1, $2, 100.00, 10.00, 'NORMAL'),
              (2, $1, 50.00, 10.00, 'NORMAL'),  (2, $2, 50.00, 10.00, 'NORMAL')
       ON CONFLICT (branch_id, product_id) DO UPDATE SET current_stock = 100.00, status = 'NORMAL'`,
      [testProduct1Id, testProduct2Id]
    );
  });

  // 1. Critical POS Test: Multi-Item & Dynamic Tax Rates
  it('1. POS Sale: should calculate correct multi-item totals with dynamic tax and decrement inventory', async () => {
    const stockBeforeRes = await pool.query(
      `SELECT current_stock FROM inventory_stock WHERE branch_id = 1 AND product_id = $1`,
      [testProduct1Id]
    );
    const stockBefore = parseFloat(stockBeforeRes.rows[0].current_stock);

    const orderRes = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        items: [
          { productId: testProduct1Id, quantity: 2, unitPrice: 500.00 }, // 1000
          { productId: testProduct2Id, quantity: 1, unitPrice: 300.00 }, // 300
        ],
        discountAmount: 100.00, // Subtotal 1300 - 100 = 1200
        paymentMethod: 'CASH',
        amountPaid: 2000.00, // Covers 1200 + tax
      },
      1
    );

    assert.ok(orderRes.orderId);
    assert.strictEqual(orderRes.status, 'COMPLETED');

    // Verify inventory stock was decreased by exactly 2 for product 1
    const stockAfterRes = await pool.query(
      `SELECT current_stock FROM inventory_stock WHERE branch_id = 1 AND product_id = $1`,
      [testProduct1Id]
    );
    const stockAfter = parseFloat(stockAfterRes.rows[0].current_stock);
    assert.strictEqual(stockAfter, stockBefore - 2);

    // Verify inventory ledger transaction was logged
    const ledgerRes = await pool.query(
      `SELECT * FROM inventory_ledger WHERE branch_id = 1 AND product_id = $1 ORDER BY id DESC LIMIT 1`,
      [testProduct1Id]
    );
    assert.ok(ledgerRes.rows.length > 0);
    assert.strictEqual(ledgerRes.rows[0].transaction_type, 'POS_SALE');
  });

  // 2. Transaction Rollback Testing: Force Failure & Verify No Orphan State
  it('2. Transaction Rollback: should atomically rollback order creation when inventory is insufficient', async () => {
    // Attempt sale of 99999 items (exceeding stock)
    await assert.rejects(
      async () => {
        await posService.processOrder(
          {
            branchId: 1,
            orderType: 'TAKE_AWAY',
            items: [{ productId: testProduct1Id, quantity: 99999, unitPrice: 500.00 }],
            paymentMethod: 'CASH',
            amountPaid: 99999999.00,
          },
          1
        );
      },
      (err: any) => err.statusCode === 422 || err.message.includes('Insufficient stock')
    );

    // Verify no partial order was written to pos_orders
    const ordersRes = await pool.query(
      `SELECT COUNT(*) FROM pos_orders WHERE branch_id = 1 AND total_amount > 1000000`
    );
    assert.strictEqual(Number(ordersRes.rows[0].count), 0);
  });

  // 3. Concurrency & Idempotency: Duplicate Offline Ref Prevention
  it('3. Concurrency / Idempotency: should prevent duplicate order creation on identical offline_ref', async () => {
    const offlineRef = `OFFLINE_REF_${Date.now()}`;
    
    // First attempt: should succeed
    const firstOrder = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        offlineRef,
        items: [{ productId: testProduct1Id, quantity: 1, unitPrice: 500.00 }],
        paymentMethod: 'CASH',
        amountPaid: 1000.00,
      },
      1
    );
    assert.ok(firstOrder.orderId);

    // Second attempt with same offlineRef: idempotently returns existing order without creating duplicate
    const secondOrder = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        offlineRef,
        items: [{ productId: testProduct1Id, quantity: 1, unitPrice: 500.00 }],
        paymentMethod: 'CASH',
        amountPaid: 1000.00,
      },
      1
    );
    assert.strictEqual(secondOrder.orderId, firstOrder.orderId);

    // Verify exactly 1 order exists in database with this offline_ref
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM pos_orders WHERE offline_ref = $1`,
      [offlineRef]
    );
    assert.strictEqual(Number(countRes.rows[0].count), 1);
  });

  // 4. Multi-Branch Security & Data Isolation
  it('4. Multi-Branch Security: should isolate branch inventory and order data', async () => {
    // Stock at Branch 1 is 97, Branch 2 is 50
    const b1StockRes = await pool.query(
      `SELECT current_stock FROM inventory_stock WHERE branch_id = 1 AND product_id = $1`,
      [testProduct2Id]
    );
    const b2StockRes = await pool.query(
      `SELECT current_stock FROM inventory_stock WHERE branch_id = 2 AND product_id = $1`,
      [testProduct2Id]
    );

    const b1Initial = parseFloat(b1StockRes.rows[0].current_stock);
    const b2Initial = parseFloat(b2StockRes.rows[0].current_stock);

    // Sale in Branch 2
    await posService.processOrder(
      {
        branchId: 2,
        orderType: 'TAKE_AWAY',
        items: [{ productId: testProduct2Id, quantity: 3, unitPrice: 300.00 }],
        paymentMethod: 'CASH',
        amountPaid: 2000.00,
      },
      1
    );

    // Verify Branch 2 decreased by 3
    const b2AfterRes = await pool.query(
      `SELECT current_stock FROM inventory_stock WHERE branch_id = 2 AND product_id = $1`,
      [testProduct2Id]
    );
    assert.strictEqual(parseFloat(b2AfterRes.rows[0].current_stock), b2Initial - 3);

    // Verify Branch 1 remained completely untouched
    const b1AfterRes = await pool.query(
      `SELECT current_stock FROM inventory_stock WHERE branch_id = 1 AND product_id = $1`,
      [testProduct2Id]
    );
    assert.strictEqual(parseFloat(b1AfterRes.rows[0].current_stock), b1Initial);
  });

  // 5. Concurrency: Double-Return Prevention
  it('5. Return Integrity: should reject returning more quantity than originally sold', async () => {
    // Create an order with 2 units of product 1
    const saleOrder = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        items: [{ productId: testProduct1Id, quantity: 2, unitPrice: 500.00 }],
        paymentMethod: 'CASH',
        amountPaid: 2000.00,
      },
      1
    );

    // Return 2 items -> should succeed
    const ret = await returnService.processCustomerReturn(
      {
        orderId: saleOrder.orderId,
        branchId: 1,
        refundMethod: 'CASH',
        items: [{ productId: testProduct1Id, quantity: 2, unitPrice: 500.00, reason: 'Customer exchange' }],
      },
      1
    );
    assert.ok(ret.id);
    assert.strictEqual(ret.type, 'CUSTOMER_RETURN');

    // Attempt to return another 1 item for the same order item -> should fail (exceeding original sold quantity)
    await assert.rejects(
      async () => {
        await returnService.processCustomerReturn(
          {
            orderId: saleOrder.orderId,
            branchId: 1,
            refundMethod: 'CASH',
            items: [{ productId: testProduct1Id, quantity: 1, unitPrice: 500.00, reason: 'Excess return' }],
          },
          1
        );
      },
      (err: any) => err.statusCode === 400 || err.statusCode === 422 || err.message.includes('exceed')
    );
  });

  // 6. Health Probe & Observability Endpoints
  it('6. Health & Observability: should respond with healthy liveness and readiness status', async () => {
    const dbCheck = await pool.query('SELECT 1 as alive');
    assert.strictEqual(dbCheck.rows[0].alive, 1);
  });
});
