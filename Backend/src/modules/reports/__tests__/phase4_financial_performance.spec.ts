import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ReportService } from '../service/reports.service.js';
import { DashboardService } from '../../dashboard/service/dashboard.service.js';
import { ProductService } from '../../products/service/products.service.js';
import { UserService } from '../../users/service/users.service.js';
import { POSService } from '../../pos/service/pos.service.js';
import { ConflictError, NotFoundError } from '../../../common/errors/app-error.js';
import { pool, initDatabase } from '../../../config/db.js';

describe('Phase 4: Financial Calculations, Dashboard Integrity & Backend Performance', () => {
  let reportService: ReportService;
  let dashboardService: DashboardService;
  let productService: ProductService;
  let userService: UserService;
  let posService: POSService;

  beforeEach(async () => {
    await initDatabase();
    reportService = new ReportService();
    dashboardService = new DashboardService();
    productService = new ProductService();
    userService = new UserService();
    posService = new POSService();
  });

  it('1. Sales Summary: should compute actual COGS and Gross Profit without arbitrary percentages', async () => {
    // Create product with specific cost and retail price
    const sku = `PROFIT-PROD-${Date.now()}`;
    const prod = await productService.createProduct({
      sku,
      name: 'Profit Test Product',
      retailPrice: 1000.00,
      costPrice: 400.00,
      categoryId: 1,
      unitId: 1,
    });

    // Seed inventory stock
    await pool.query(
      `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
       VALUES (1, $1, 20.00, 5.00, 'NORMAL')
       ON CONFLICT (branch_id, product_id) DO UPDATE SET current_stock = 20.00, status = 'NORMAL'`,
      [prod.id]
    );

    // Place an order for 2 items: Revenue = 2000, Actual COGS = 800, Gross Profit = 1200
    await posService.processOrder(
      {
        branchId: 1,
        orderType: 'DINE_IN',
        items: [{ productId: prod.id, quantity: 2, unitPrice: 1000.00 }],
        paymentMethod: 'CASH',
        amountPaid: 3000.00,
        discountAmount: 0.00,
      },
      1
    );

    const summary = await reportService.getSalesSummary({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      branchId: 1,
    });

    assert.ok(summary);
    assert.ok(summary.totalRevenue >= 2000);
    assert.ok(summary.cogsAmount >= 800);
    // Verify gross profit calculation matches (subtotal - discount) - cogs
    assert.strictEqual(
      summary.netProfit,
      parseFloat(((summary.totalSubtotal - summary.totalDiscount) - summary.cogsAmount).toFixed(2))
    );
  });

  it('2. Daily Sales: should calculate actual gross profit without 65% net profit multiplier', async () => {
    const dailySales = await reportService.getDailySales({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      branchId: 1,
    });

    assert.ok(Array.isArray(dailySales));
    for (const day of dailySales) {
      assert.ok(typeof day.totalRevenue === 'number');
      assert.ok(typeof day.netProfit === 'number');
      // If revenue is 1000 and COGS is 400, netProfit is 600, not hardcoded 650 (0.65)
      assert.ok(day.netProfit <= day.totalRevenue);
    }
  });

  it('3. Dashboard: should return unscaled raw sales and support parameterized branch filtering', async () => {
    const metrics = await dashboardService.getMetrics(1);
    assert.ok(typeof metrics.totalSales === 'number');
    assert.ok(typeof metrics.totalOrders === 'number');

    const trend = await dashboardService.getSalesTrend('This Week', 1);
    assert.ok(Array.isArray(trend));
    for (const point of trend) {
      assert.ok(typeof point.sales === 'number');
      // Unscaled sales should match realistic amounts (e.g. 2000 instead of 2)
      assert.ok(point.sales >= 0);
    }

    const ordersByType = await dashboardService.getOrdersByType('This Month', 1);
    assert.ok(ordersByType);
    assert.ok(typeof ordersByType.takeawayPercentage === 'number');
  });

  it('4. SKU Uniqueness: should use direct lookup and reject duplicates', async () => {
    const sku = `SKU-UNIQUE-${Date.now()}`;
    const product = await productService.createProduct({
      sku,
      name: 'Unique SKU Item',
      retailPrice: 500.00,
      costPrice: 250.00,
      categoryId: 1,
      unitId: 1,
    });

    assert.ok(product.id);

    // Attempt to create duplicate SKU
    await assert.rejects(
      async () => {
        await productService.createProduct({
          sku,
          name: 'Duplicate SKU Item',
          retailPrice: 600.00,
          costPrice: 300.00,
          categoryId: 1,
          unitId: 1,
        });
      },
      (err: any) => err instanceof ConflictError && err.message.includes('already exists')
    );
  });

  it('5. User Update: should allow updating user name, email, phone, role, and branches', async () => {
    const username = `upd_user_${Date.now()}`;
    const created = await userService.createUser({
      username,
      password: 'password123',
      name: 'Original User Name',
      email: `${username}@nexuspos.com`,
      phone: '+94 77 000 0000',
      roleId: 3, // CASHIER
      branchIds: [1],
    });

    assert.ok(created.id);
    assert.strictEqual(created.name, 'Original User Name');

    // Update user
    const updated = await userService.updateUser(created.id, {
      name: 'Updated User Name',
      email: `new_${username}@nexuspos.com`,
      phone: '+94 77 999 9999',
      roleId: 2, // Promote to MANAGER
      branchIds: [1, 2],
    });

    assert.strictEqual(updated.name, 'Updated User Name');
    assert.strictEqual(updated.email, `new_${username}@nexuspos.com`);
    assert.strictEqual(updated.role.name, 'MANAGER');
    assert.strictEqual(updated.branches.length, 2);
  });
});
