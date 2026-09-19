import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DashboardService } from '../service/dashboard.service.js';

describe('DashboardService Unit Tests', () => {
  let service: DashboardService;

  beforeEach(() => {
    service = new DashboardService();
  });

  it('should instantiate DashboardService cleanly', () => {
    assert.ok(service);
  });

  it('should define getMetrics, getSalesTrend, getOrdersByType, getRecentSales, getLowStockAlerts methods', () => {
    assert.strictEqual(typeof service.getMetrics, 'function');
    assert.strictEqual(typeof service.getSalesTrend, 'function');
    assert.strictEqual(typeof service.getOrdersByType, 'function');
    assert.strictEqual(typeof service.getRecentSales, 'function');
    assert.strictEqual(typeof service.getLowStockAlerts, 'function');
  });
});
