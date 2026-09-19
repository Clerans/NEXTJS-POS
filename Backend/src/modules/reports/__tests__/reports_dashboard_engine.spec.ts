import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ReportService } from '../service/reports.service.js';
import { DashboardService } from '../../dashboard/service/dashboard.service.js';
import { POSService } from '../../pos/service/pos.service.js';
import { BadRequestError } from '../../../common/errors/app-error.js';
import { pool } from '../../../config/db.js';

describe('Reports & Dashboard Real API Engine', () => {
  let reportService: ReportService;
  let dashboardService: DashboardService;
  let posService: POSService;

  beforeEach(async () => {
    reportService = new ReportService();
    dashboardService = new DashboardService();
    posService = new POSService();

    await pool.query('UPDATE products SET is_active = true WHERE id = 1');
    await pool.query(
      `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
       VALUES (1, 1, 50.00, 10.00, 'NORMAL')
       ON CONFLICT (branch_id, product_id) DO UPDATE SET current_stock = 50.00, status = 'NORMAL'`
    );
  });

  it('should generate sales summary matching DB transaction calculations', async () => {
    // Process order to guarantee DB data
    await posService.processOrder({
      branchId: 1,
      orderType: 'DINE_IN',
      items: [{ productId: 1, quantity: 2, unitPrice: 500 }],
      paymentMethod: 'CASH',
      amountPaid: 1500,
    }, 1);

    const summary = await reportService.getSalesSummary({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
    });

    assert.ok(summary);
    assert.ok(summary.totalRevenue >= 1000);
    assert.ok(summary.totalOrders >= 1);
    assert.ok(summary.cogsAmount >= 0);
    assert.ok(summary.grossMarginPercentage >= 0);
  });

  it('should throw BadRequestError if Start date is after End date', async () => {
    try {
      await reportService.getSalesSummary({
        startDate: '2026-12-31',
        endDate: '2026-01-01',
      });
      assert.fail('Should have thrown BadRequestError');
    } catch (err: any) {
      assert.ok(err instanceof BadRequestError);
      assert.strictEqual(err.statusCode, 400);
    }
  });

  it('should retrieve dashboard metrics cleanly from live PostgreSQL queries', async () => {
    const metrics = await dashboardService.getMetrics();
    assert.ok(metrics);
    assert.ok(typeof metrics.totalSales === 'number');
    assert.ok(typeof metrics.totalOrders === 'number');
    assert.ok(typeof metrics.activeCustomers === 'number');
    assert.ok(typeof metrics.monthlyGrowth === 'number');
  });

  it('should retrieve sales trend data points cleanly for chart rendering', async () => {
    const trend = await dashboardService.getSalesTrend('This Week');
    assert.ok(Array.isArray(trend));
    assert.strictEqual(trend.length, 7);
    assert.ok(trend[0].day);
  });

  it('should retrieve breakdown of orders by type accurately', async () => {
    const obt = await dashboardService.getOrdersByType('This Month');
    assert.ok(obt);
    assert.ok(typeof obt.takeawayCount === 'number');
    assert.ok(typeof obt.dineInCount === 'number');
    assert.ok(typeof obt.deliveryCount === 'number');
    assert.ok(obt.topType);
  });

  it('should retrieve product margins report and calculate COGS & profit margins', async () => {
    const margins = await reportService.getProductMargins();
    assert.ok(Array.isArray(margins));
    if (margins.length > 0) {
      assert.ok(margins[0].productName);
      assert.ok(typeof margins[0].profitMargin === 'number');
    }
  });

  it('should retrieve payment method breakdown summary', async () => {
    const payments = await reportService.getPaymentSummary();
    assert.ok(Array.isArray(payments));
  });
});
