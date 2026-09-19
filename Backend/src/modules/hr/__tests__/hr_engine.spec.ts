import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { HRService } from '../service/hr.service.js';
import { NotFoundError, BadRequestError } from '../../../common/errors/app-error.js';

describe('Human Resources (HR) Engine', () => {
  let hrService: HRService;

  beforeEach(() => {
    hrService = new HRService();
  });

  it('should retrieve list of registered employees cleanly', async () => {
    const employees = await hrService.getAllEmployees();
    assert.ok(Array.isArray(employees));
    assert.ok(employees.length >= 2);
  });

  it('should create employee profile cleanly and assign base salary', async () => {
    const code = `EMP-TEST-${Date.now().toString().slice(-4)}`;
    const emp = await hrService.createEmployee({
      employeeCode: code,
      name: 'Sunil Shantha',
      jobTitle: 'Senior Manager',
      branch: 'Colombo Main Outlet',
      mobile: '+94 77 999 8888',
      baseSalary: 120000.00,
    });

    assert.ok(emp);
    assert.strictEqual(emp.employeeCode, code);
    assert.strictEqual(emp.name, 'Sunil Shantha');
    assert.strictEqual(emp.baseSalary, 120000.00);
  });

  it('should update employee profile details transactionally', async () => {
    const updated = await hrService.updateEmployee({
      employeeId: 1,
      jobTitle: 'Lead Executive Barista',
      baseSalary: 105000.00,
    });

    assert.ok(updated);
    assert.strictEqual(updated.jobTitle, 'Lead Executive Barista');
    assert.strictEqual(updated.baseSalary, 105000.00);
  });

  it('should clock in employee and record attendance entry', async () => {
    const attendance = await hrService.clockIn({ employeeId: 1 });
    assert.ok(attendance);
    assert.strictEqual(attendance.employeeId, 1);
    assert.ok(attendance.clockIn);
    assert.strictEqual(attendance.clockOut, null);
  });

  it('should clock out employee and record clock out timestamp', async () => {
    const clockInRes = await hrService.clockIn({ employeeId: 1 });
    const clockOutRes = await hrService.clockOut({ attendanceId: clockInRes.id });
    assert.ok(clockOutRes);
    assert.strictEqual(clockOutRes.id, clockInRes.id);
    assert.ok(clockOutRes.clockOut);
  });

  it('should schedule shift for an employee', async () => {
    const shift = await hrService.createShift({
      employeeId: 1,
      branchId: 1,
      shiftDate: '2026-08-15',
      startTime: '08:00',
      endTime: '17:00',
    });

    assert.ok(shift);
    assert.strictEqual(shift.employeeId, 1);
    assert.strictEqual(shift.status, 'SCHEDULED');
  });

  it('should submit leave request and approve leave request', async () => {
    const req = await hrService.createLeaveRequest({
      employeeId: 1,
      leaveType: 'ANNUAL',
      startDate: '2026-08-20',
      endDate: '2026-08-22',
      reason: 'Personal vacation',
    });

    assert.ok(req);
    assert.strictEqual(req.status, 'PENDING');

    const approved = await hrService.approveLeave({
      leaveRequestId: req.id,
      status: 'APPROVED',
    }, 1);

    assert.ok(approved);
    assert.strictEqual(approved.status, 'APPROVED');
  });

  it('should calculate monthly payroll backend-controlled with overtime, claims, and deductions', async () => {
    const payroll = await hrService.calculatePayroll({
      employeeId: 1,
      monthYear: '2026-08',
      baseSalary: 160000, // 1000 per hour base
      overtimeHours: 10,
      overtimeRate: 1.5, // 15,000 overtime
      transportClaims: 5000,
      deductions: 10000,
    });

    assert.ok(payroll);
    assert.strictEqual(payroll.employeeId, 1);
    assert.strictEqual(payroll.baseAmount, 160000);
    assert.strictEqual(payroll.overtimeAmount, 15000);
    assert.strictEqual(payroll.claimsAmount, 5000);
    assert.strictEqual(payroll.deductionsAmount, 10000);
    assert.strictEqual(payroll.netPay, 170000); // 160k + 15k + 5k - 10k = 170k
    assert.strictEqual(payroll.status, 'DRAFT');
  });

  it('should throw BadRequestError if Net Pay is negative', async () => {
    try {
      await hrService.calculatePayroll({
        employeeId: 1,
        monthYear: '2026-08',
        baseSalary: 50000,
        overtimeHours: 0,
        overtimeRate: 1.0,
        deductions: 60000,
      });
      assert.fail('Should have thrown BadRequestError');
    } catch (err: any) {
      assert.ok(err instanceof BadRequestError);
      assert.strictEqual(err.statusCode, 400);
    }
  });

  it('should throw NotFoundError when employee ID does not exist', async () => {
    try {
      await hrService.clockIn({ employeeId: 999999 });
      assert.fail('Should have thrown NotFoundError');
    } catch (err: any) {
      assert.ok(err instanceof NotFoundError);
      assert.strictEqual(err.statusCode, 404);
    }
  });
});
