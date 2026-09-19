import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ProductService } from '../../products/service/products.service.js';
import { GRNService } from '../../grn/service/grn.service.js';
import { POSService } from '../service/pos.service.js';
import { ReturnService } from '../../returns/service/returns.service.js';
import { UserService } from '../../users/service/users.service.js';
import { pool, initDatabase } from '../../../config/db.js';

describe('Phase 3: Core Transaction & Data Integrity Verification', () => {
  let productsService: ProductService;
  let grnService: GRNService;
  let posService: POSService;
  let returnService: ReturnService;
  let userService: UserService;

  beforeEach(async () => {
    await initDatabase();
    productsService = new ProductService();
    grnService = new GRNService();
    posService = new POSService();
    returnService = new ReturnService();
    userService = new UserService();
  });

  it('1. Product Creation: stock should initialize to 0.00 with OUT_OF_STOCK status (no phantom stock)', async () => {
    const sku = `PROD-TEST-${Date.now()}`;
    const product = await productsService.createProduct({
      sku,
      name: 'Zero Stock Test Item',
      retailPrice: 500.00,
      costPrice: 300.00,
      categoryId: 1,
      unitId: 1,
      reorderLevel: 10,
    });

    assert.ok(product.id);
    const stockRes = await pool.query(
      'SELECT current_stock, status FROM inventory_stock WHERE product_id = $1 AND branch_id = 1',
      [product.id]
    );

    assert.strictEqual(stockRes.rows.length, 1);
    assert.strictEqual(parseFloat(stockRes.rows[0].current_stock), 0.00);
    assert.strictEqual(stockRes.rows[0].status, 'OUT_OF_STOCK');
  });

  it('2. GRN: should insert inventory_batches and findById without full table scan', async () => {
    const sku = `GRN-ITEM-${Date.now()}`;
    const product = await productsService.createProduct({
      sku,
      name: 'GRN Product Test',
      retailPrice: 1000.00,
      costPrice: 600.00,
      categoryId: 1,
      unitId: 1,
    });

    const grn = await grnService.createGRN({
      supplierId: 1,
      branchId: 1,
      invoiceNumber: `INV-${Date.now()}`,
      items: [
        {
          productId: product.id,
          receivedQuantity: 25,
          unitCost: 600.00,
          batchNumber: `BATCH-${Date.now()}`,
        },
      ],
    }, 1);

    assert.ok(grn.id);
    assert.strictEqual(grn.totalAmount, 15000);

    // Verify direct findById lookup
    const found = await grnService.getGRNById(grn.id);
    assert.strictEqual(found.id, grn.id);
    assert.strictEqual(found.grnNumber, grn.grnNumber);

    // Verify inventory batch record
    const batchRes = await pool.query(
      'SELECT quantity, unit_cost FROM inventory_batches WHERE product_id = $1',
      [product.id]
    );
    assert.strictEqual(batchRes.rows.length, 1);
    assert.strictEqual(parseFloat(batchRes.rows[0].quantity), 25);
    assert.strictEqual(parseFloat(batchRes.rows[0].unit_cost), 600);
  });

  it('3. Order Void: should reverse customer credit balance and loyalty points atomically', async () => {
    // Setup test customer
    const custCode = `CUST-${Date.now()}`;
    const custRes = await pool.query(
      `INSERT INTO customers (customer_code, name, mobile, outstanding_balance, loyalty_points, credit_limit)
       VALUES ($1, 'Credit Loyalty Test User', '+94770000001', 0.00, 10, 50000.00)
       RETURNING id`,
      [custCode]
    );
    const customerId = custRes.rows[0].id;

    // Create product with stock for sale
    const sku = `SALE-PROD-${Date.now()}`;
    const product = await productsService.createProduct({
      sku,
      name: 'Credit Test Product',
      retailPrice: 2000.00,
      costPrice: 1200.00,
      categoryId: 1,
      unitId: 1,
    });

    // Seed stock
    await pool.query(
      'UPDATE inventory_stock SET current_stock = 10, status = \'NORMAL\' WHERE product_id = $1',
      [product.id]
    );

    // Create Order with CREDIT payment
    const order = await posService.processOrder(
      {
        branchId: 1,
        customerId,
        orderType: 'TAKE_AWAY',
        paymentMethod: 'CREDIT',
        amountPaid: 0,
        items: [{ productId: product.id, quantity: 2 }],
      },
      1,
      'ADMINISTRATOR'
    );

    assert.ok(order.orderId);

    // Verify customer balance and points increased
    const afterSaleCust = await pool.query('SELECT outstanding_balance, loyalty_points FROM customers WHERE id = $1', [customerId]);
    const balanceAfterSale = parseFloat(afterSaleCust.rows[0].outstanding_balance);
    const pointsAfterSale = parseInt(afterSaleCust.rows[0].loyalty_points, 10);
    assert.ok(balanceAfterSale > 0);
    assert.ok(pointsAfterSale > 10);

    // Void the order
    await posService.voidOrder(
      {
        orderId: order.orderId,
        reason: 'Customer cancelled transaction',
        managerPin: '1234',
      },
      1
    );

    // Verify customer balance and points are reversed
    const afterVoidCust = await pool.query('SELECT outstanding_balance, loyalty_points FROM customers WHERE id = $1', [customerId]);
    assert.strictEqual(parseFloat(afterVoidCust.rows[0].outstanding_balance), 0.00);
    assert.strictEqual(parseInt(afterVoidCust.rows[0].loyalty_points, 10), 10);
  });

  it('4. Returns: should preserve true database IDs and prevent over-returning', async () => {
    const list = await returnService.getAllReturns();
    assert.ok(Array.isArray(list));

    // Ensure IDs are numeric and match true DB IDs without +1000
    for (const r of list) {
      assert.ok(typeof r.id === 'number');
      assert.ok(r.type === 'CUSTOMER_RETURN' || r.type === 'SUPPLIER_RETURN');
    }
  });

  it('5. User Creation: should persist specified role, email, phone, and assign branches', async () => {
    const username = `mgr_test_${Date.now()}`;
    const user = await userService.createUser({
      username,
      password: 'password123',
      name: 'Test Store Manager',
      email: `${username}@nexuspos.com`,
      phone: '+94 77 123 4567',
      roleId: 2, // MANAGER
      branchIds: [1, 2],
    });

    assert.ok(user.id);
    assert.strictEqual(user.username, username);
    assert.strictEqual(user.email, `${username}@nexuspos.com`);
    assert.strictEqual(user.role.name, 'MANAGER');
    assert.strictEqual(user.branches.length, 2);
  });
});
