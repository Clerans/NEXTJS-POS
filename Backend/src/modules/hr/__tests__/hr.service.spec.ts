import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { HRService } from '../service/hr.service.js';

describe('HRService', () => {
  let hrService: HRService;

  beforeEach(() => {
    hrService = new HRService();
  });

  it('should calculate monthly payroll correctly with base, overtime, and claims', async () => {
    const payroll = await hrService.calculatePayroll({
      employeeId: 1,
      monthYear: '2026-08',
      baseSalary: 160000, // 1000/hr
      overtimeHours: 10,   // 10 * (1000 * 1.5) = 15,000
      overtimeRate: 1.5,
      transportClaims: 5000,
      deductions: 2000,
    });

    assert.ok(payroll);
    assert.strictEqual(payroll.baseAmount, 160000);
    assert.strictEqual(payroll.overtimeAmount, 15000);
    assert.strictEqual(payroll.netPay, 178000); // (160000 + 15000 + 5000) - 2000
    assert.strictEqual(payroll.status, 'DRAFT');
  });

  it('should clock-in an existing employee cleanly', async () => {
    const att = await hrService.clockIn({ employeeId: 1 });
    assert.ok(att);
    assert.strictEqual(att.employeeId, 1);
    assert.ok(att.clockIn);
  });
});
