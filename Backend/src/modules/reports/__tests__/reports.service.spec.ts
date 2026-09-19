import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ReportService } from '../service/reports.service.js';

describe('ReportService', () => {
  let reportService: ReportService;

  beforeEach(() => {
    reportService = new ReportService();
  });

  it('should generate sales summary report cleanly', async () => {
    const summary = await reportService.getSalesSummary({
      startDate: '2026-08-01',
      endDate: '2026-08-04',
    });

    assert.ok(summary);
    assert.ok(typeof summary.totalRevenue === 'number');
    assert.ok(typeof summary.totalOrders === 'number');
    assert.ok(typeof summary.grossMarginPercentage === 'number');
  });

  it('should throw BadRequestError if Start date is after End date', async () => {
    try {
      await reportService.getSalesSummary({
        startDate: '2026-08-10',
        endDate: '2026-08-01',
      });
      assert.fail('Should have thrown BadRequestError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
    }
  });
});
