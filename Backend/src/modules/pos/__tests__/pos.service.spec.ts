import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import { POSService } from '../service/pos.service.js';
import { pool } from '../../../config/db.js';
import { UnprocessableEntityError, ForbiddenError } from '../../../common/errors/app-error.js';

describe('POSService Integration', () => {
  let posService: POSService;

  beforeEach(async () => {
    posService = new POSService();
    await pool.query('UPDATE products SET is_active = true WHERE id = 1');
    await pool.query(
      `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
       VALUES (1, 1, 100, 10, 'NORMAL')
       ON CONFLICT (branch_id, product_id) DO UPDATE SET current_stock = 100`
    );

    // Setup customer with credit_limit = 2000 and outstanding_balance = 0
    await pool.query(
      `INSERT INTO customers (id, customer_code, name, mobile, credit_limit, outstanding_balance)
       VALUES (99, 'CUST-CREDIT-TEST', 'Credit Test Customer', '+94 77 000 9999', 2000.00, 0.00)
       ON CONFLICT (id) DO UPDATE SET credit_limit = 2000.00, outstanding_balance = 0.00`
    );

    // Ensure admin user with PIN 1234 exists
    const hashedPin = await bcrypt.hash('1234', 10);
    await pool.query(
      `UPDATE users SET pin_code_hash = $1 WHERE id = 1`,
      [hashedPin]
    );
  });

  it('should process sales order and calculate totals & change correctly using backend retail prices', async () => {
    const result = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        items: [{ productId: 1, quantity: 2 }],
        discountAmount: 100,
        paymentMethod: 'CASH',
        amountPaid: 1000,
      },
      1,
      'MANAGER'
    );

    assert.ok(result);
    assert.strictEqual(result.subtotal, 960);
    assert.strictEqual(result.totalAmount, 967.50);
    assert.strictEqual(result.changeGiven, 32.50);
    assert.strictEqual(result.status, 'COMPLETED');
  });

  it('should return existing order when submitting duplicate offlineRef (idempotency check)', async () => {
    const offlineRef = `OFFLINE-TEST-${Date.now()}`;
    const payload = {
      branchId: 1,
      orderType: 'TAKE_AWAY' as const,
      items: [{ productId: 1, quantity: 1 }],
      paymentMethod: 'CASH' as const,
      amountPaid: 1000,
    };

    const firstOrder = await posService.processOrder(payload, 1, 'CASHIER', offlineRef);
    const secondOrder = await posService.processOrder(payload, 1, 'CASHIER', offlineRef);

    assert.strictEqual(firstOrder.orderId, secondOrder.orderId);
    assert.strictEqual(firstOrder.orderNo, secondOrder.orderNo);
  });

  it('should advance KDS status through workflow (RECEIVED -> PREPARING -> READY -> SERVED)', async () => {
    const order = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        items: [{ productId: 1, quantity: 1 }],
        paymentMethod: 'CASH',
        amountPaid: 1000,
      },
      1
    );

    // Initial status is RECEIVED
    await posService.updateKDSStatus(order.orderId, 'PREPARING');
    await posService.updateKDSStatus(order.orderId, 'READY');
    await posService.updateKDSStatus(order.orderId, 'SERVED');

    const activeTickets = await posService.getKDSOrders();
    const isStillActive = activeTickets.some((t) => t.orderId === order.orderId);
    assert.strictEqual(isStillActive, false, 'SERVED ticket should no longer be in active KDS board');
  });

  it('should reject invalid KDS status transitions', async () => {
    const order = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        items: [{ productId: 1, quantity: 1 }],
        paymentMethod: 'CASH',
        amountPaid: 1000,
      },
      1
    );

    // Trying RECEIVED -> READY directly should fail
    await assert.rejects(
      async () => {
        await posService.updateKDSStatus(order.orderId, 'READY');
      },
      (err: any) => err instanceof UnprocessableEntityError
    );
  });

  it('should process normal credit sale within customer credit limit', async () => {
    const result = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        customerId: 99,
        items: [{ productId: 1, quantity: 1 }],
        paymentMethod: 'CREDIT',
        amountPaid: 0,
      },
      1
    );

    assert.ok(result);
    assert.strictEqual(result.paymentMethod, 'CREDIT');
  });

  it('should throw UnprocessableEntityError when credit order exceeds credit limit', async () => {
    try {
      await posService.processOrder(
        {
          branchId: 1,
          orderType: 'TAKE_AWAY',
          customerId: 99,
          items: [{ productId: 1, quantity: 10 }],
          paymentMethod: 'CREDIT',
          amountPaid: 0,
        },
        1
      );
      assert.fail('Should have thrown UnprocessableEntityError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 422);
      assert.ok(err.message.includes('Credit limit exceeded'));
    }
  });

  it('should allow manager PIN override when credit limit is exceeded', async () => {
    const result = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        customerId: 99,
        items: [{ productId: 1, quantity: 10 }],
        paymentMethod: 'CREDIT',
        amountPaid: 0,
        managerPin: '1234',
      },
      1
    );

    assert.ok(result);
    assert.strictEqual(result.paymentMethod, 'CREDIT');
  });

  it('should throw UnprocessableEntityError when payment amount is insufficient for CASH', async () => {
    try {
      await posService.processOrder(
        {
          branchId: 1,
          orderType: 'TAKE_AWAY',
          items: [{ productId: 1, quantity: 1 }],
          paymentMethod: 'CASH',
          amountPaid: 200,
        },
        1
      );
      assert.fail('Should have thrown UnprocessableEntityError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 422);
    }
  });

  it('should throw ForbiddenError when manager PIN is invalid for voiding order', async () => {
    try {
      await posService.voidOrder(
        {
          orderId: 101,
          reason: 'Test cancellation',
          managerPin: '9999',
        },
        1
      );
      assert.fail('Should have thrown ForbiddenError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 403);
    }
  });

  it('should fetch sales history orders and return formatted data array', async () => {
    const res = await posService.getAllOrders({ page: 1, limit: 10 });
    assert.ok(res);
    assert.ok(Array.isArray(res.data));
    assert.ok(res.meta);
    assert.strictEqual(res.meta.page, 1);
  });
});
