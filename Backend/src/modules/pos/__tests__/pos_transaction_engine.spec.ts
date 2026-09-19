import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import { POSService } from '../service/pos.service.js';
import { pool } from '../../../config/db.js';
import { UnprocessableEntityError, ForbiddenError } from '../../../common/errors/app-error.js';

describe('POS Transaction Engine', () => {
  let posService: POSService;

  beforeEach(async () => {
    posService = new POSService();

    // Ensure product #1 is active and has stock
    await pool.query('UPDATE products SET is_active = true WHERE id = 1');
    await pool.query(
      `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
       VALUES (1, 1, 100, 10, 'NORMAL')
       ON CONFLICT (branch_id, product_id) DO UPDATE SET current_stock = 100`
    );

    // Ensure manager PIN '1234' is hashed for user 1
    const hashedPin = await bcrypt.hash('1234', 10);
    await pool.query('UPDATE users SET pin_code_hash = $1 WHERE id = 1', [hashedPin]);
  });

  it('should process single item POS checkout with backend financial calculations', async () => {
    // Product #1 price = 480.00, Tax = 10% (48.00), Service charge Dine In 5% (24.00). Total = 552.00
    const result = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'DINE_IN',
        paymentMethod: 'CASH',
        amountPaid: 600.00,
        items: [{ productId: 1, quantity: 1 }],
      },
      1
    );

    assert.ok(result);
    assert.strictEqual(result.subtotal, 480.00);
    assert.strictEqual(result.totalAmount, 564.00);
    assert.strictEqual(result.changeGiven, 36.00);
  });

  it('should reject CASH order when amount paid is less than grand total', async () => {
    await assert.rejects(
      async () => {
        await posService.processOrder(
          {
            branchId: 1,
            orderType: 'TAKE_AWAY',
            paymentMethod: 'CASH',
            amountPaid: 100.00, // Total is 528.00
            items: [{ productId: 1, quantity: 1 }],
          },
          1
        );
      },
      (err: any) => err instanceof UnprocessableEntityError
    );
  });

  it('should update customer loyalty points when customer ID is assigned', async () => {
    const result = await posService.processOrder(
      {
        branchId: 1,
        customerId: 1,
        orderType: 'TAKE_AWAY',
        paymentMethod: 'CASH',
        amountPaid: 1500.00,
        items: [{ productId: 1, quantity: 2 }],
      },
      1
    );

    assert.ok(result);

    const custRes = await pool.query('SELECT loyalty_points FROM customers WHERE id = 1');
    assert.ok(parseInt(custRes.rows[0].loyalty_points, 10) > 0);
  });

  it('should void active sales order ticket when valid manager PIN is provided', async () => {
    const order = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        paymentMethod: 'CASH',
        amountPaid: 600.00,
        items: [{ productId: 1, quantity: 1 }],
      },
      1
    );

    await posService.voidOrder(
      {
        orderId: order.orderId,
        reason: 'Customer requested cancellation',
        managerPin: '1234',
      },
      1
    );

    const checkOrder = await posService.getOrderById(order.orderId);
    assert.strictEqual(checkOrder.status, 'VOIDED');
  });

  it('should reject void request when manager PIN is invalid', async () => {
    const order = await posService.processOrder(
      {
        branchId: 1,
        orderType: 'TAKE_AWAY',
        paymentMethod: 'CASH',
        amountPaid: 600.00,
        items: [{ productId: 1, quantity: 1 }],
      },
      1
    );

    await assert.rejects(
      async () => {
        await posService.voidOrder(
          {
            orderId: order.orderId,
            reason: 'Unauthorized attempt',
            managerPin: '9999',
          },
          1
        );
      },
      (err: any) => err instanceof ForbiddenError
    );
  });
});
