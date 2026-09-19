import { pool } from '../../../config/db.js';
import {
  EmployeeResponseDto,
  AttendanceResponseDto,
  PayrollResponseDto,
  CalculatePayrollDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateShiftDto,
  ShiftResponseDto,
  CreateLeaveRequestDto,
  LeaveRequestResponseDto,
} from '../dto/hr.dto.js';

export class HRRepository {
  async findAllEmployees(): Promise<EmployeeResponseDto[]> {
    const result = await pool.query(
      `SELECT e.id, e.employee_code, e.name, e.job_title, e.branch_id, COALESCE(b.name, e.branch, 'NEXUS Main Outlet') as branch_name,
              e.mobile, e.employment_status, e.hired_date, e.salary_amount
       FROM employees e
       LEFT JOIN branches b ON e.branch_id = b.id
       ORDER BY e.id ASC`
    );

    if (result.rows.length === 0) {
      await pool.query(`
        INSERT INTO employees (employee_code, name, job_title, branch_id, branch, mobile, employment_status, hired_date, salary_amount)
        VALUES 
          ('EMP-001', 'Kamal Perera', 'Head Barista', 1, 'NEXUS Main Outlet', '+94 77 123 4567', 'ACTIVE', '2024-01-15', 95000.00),
          ('EMP-002', 'Nimal Silva', 'POS Cashier', 1, 'NEXUS Main Outlet', '+94 71 987 6543', 'ACTIVE', '2024-03-01', 65000.00)
        ON CONFLICT DO NOTHING;
      `);
      return this.findAllEmployees();
    }

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      employeeCode: row.employee_code,
      name: row.name,
      jobTitle: row.job_title,
      branchId: parseInt(row.branch_id || '1', 10),
      branch: row.branch_name,
      branchName: row.branch_name,
      mobile: row.mobile,
      employmentStatus: row.employment_status,
      hiredDate: row.hired_date,
      baseSalary: parseFloat(row.salary_amount || '75000'),
    }));
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    let branchId = dto.branchId || 1;
    if (!dto.branchId && dto.branch) {
      const bRes = await pool.query(
        'SELECT id FROM branches WHERE LOWER(name) = LOWER($1) OR LOWER(code) = LOWER($1) LIMIT 1',
        [dto.branch.trim()]
      );
      if (bRes.rows.length > 0) {
        branchId = bRes.rows[0].id;
      }
    }

    const result = await pool.query(
      `INSERT INTO employees (employee_code, name, job_title, branch_id, branch, mobile, employment_status, hired_date, salary_amount)
       VALUES ($1, $2, $3, $4, (SELECT name FROM branches WHERE id = $4), $5, $6, $7, $8)
       RETURNING id, employee_code, name, job_title, branch_id, branch, mobile, employment_status, hired_date, salary_amount`,
      [
        dto.employeeCode,
        dto.name,
        dto.jobTitle,
        branchId,
        dto.mobile,
        dto.employmentStatus || 'ACTIVE',
        dto.hiredDate || new Date().toISOString().split('T')[0],
        dto.baseSalary || 75000.00,
      ]
    );

    const row = result.rows[0];
    const branchName = row.branch || 'NEXUS Main Outlet';
    return {
      id: parseInt(row.id, 10),
      employeeCode: row.employee_code,
      name: row.name,
      jobTitle: row.job_title,
      branchId: parseInt(row.branch_id || String(branchId), 10),
      branch: branchName,
      branchName,
      mobile: row.mobile,
      employmentStatus: row.employment_status,
      hiredDate: row.hired_date,
      baseSalary: parseFloat(row.salary_amount || '75000'),
    };
  }

  async updateEmployee(dto: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
    let branchId = dto.branchId;
    if (!branchId && dto.branch) {
      const bRes = await pool.query(
        'SELECT id FROM branches WHERE LOWER(name) = LOWER($1) OR LOWER(code) = LOWER($1) LIMIT 1',
        [dto.branch.trim()]
      );
      if (bRes.rows.length > 0) {
        branchId = bRes.rows[0].id;
      }
    }

    const result = await pool.query(
      `UPDATE employees
       SET name = COALESCE($2, name),
           job_title = COALESCE($3, job_title),
           branch_id = COALESCE($4, branch_id),
           branch = CASE WHEN $4 IS NOT NULL THEN (SELECT name FROM branches WHERE id = $4) ELSE branch END,
           mobile = COALESCE($5, mobile),
           employment_status = COALESCE($6, employment_status),
           salary_amount = COALESCE($7, salary_amount)
       WHERE id = $1
       RETURNING id, employee_code, name, job_title, branch_id, branch, mobile, employment_status, hired_date, salary_amount`,
      [
        dto.employeeId,
        dto.name,
        dto.jobTitle,
        branchId || null,
        dto.mobile,
        dto.employmentStatus,
        dto.baseSalary,
      ]
    );

    const row = result.rows[0];
    const branchName = row.branch || 'NEXUS Main Outlet';
    return {
      id: parseInt(row.id, 10),
      employeeCode: row.employee_code,
      name: row.name,
      jobTitle: row.job_title,
      branchId: parseInt(row.branch_id || '1', 10),
      branch: branchName,
      branchName,
      mobile: row.mobile,
      employmentStatus: row.employment_status,
      hiredDate: row.hired_date,
      baseSalary: parseFloat(row.salary_amount || '75000'),
    };
  }

  async clockIn(employeeId: number): Promise<AttendanceResponseDto> {
    const empRes = await pool.query('SELECT name FROM employees WHERE id = $1', [employeeId]);
    const empName = empRes.rows[0]?.name || 'Employee';

    const result = await pool.query(
      `INSERT INTO attendance (employee_id, clock_in, overtime_hours)
       VALUES ($1, CURRENT_TIMESTAMP, 0)
       RETURNING id, clock_in`,
      [employeeId]
    );

    return {
      id: parseInt(result.rows[0].id, 10),
      employeeId,
      employeeName: empName,
      clockIn: result.rows[0].clock_in,
      clockOut: null,
      overtimeHours: 0,
      lateMinutes: 0,
    };
  }

  async clockOut(attendanceId: number): Promise<AttendanceResponseDto> {
    const result = await pool.query(
      `UPDATE attendance
       SET clock_out = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, employee_id, clock_in, clock_out, overtime_hours, late_minutes`,
      [attendanceId]
    );

    const row = result.rows[0];
    const empRes = await pool.query('SELECT name FROM employees WHERE id = $1', [row.employee_id]);

    return {
      id: parseInt(row.id, 10),
      employeeId: parseInt(row.employee_id, 10),
      employeeName: empRes.rows[0]?.name || 'Employee',
      clockIn: row.clock_in,
      clockOut: row.clock_out,
      overtimeHours: parseFloat(row.overtime_hours || 0),
      lateMinutes: parseInt(row.late_minutes || 0, 10),
    };
  }

  async createShift(dto: CreateShiftDto): Promise<ShiftResponseDto> {
    const empRes = await pool.query('SELECT name FROM employees WHERE id = $1', [dto.employeeId]);
    const empName = empRes.rows[0]?.name || 'Employee';

    const result = await pool.query(
      `INSERT INTO employee_shifts (employee_id, branch_id, shift_date, start_time, end_time, status)
       VALUES ($1, $2, $3, $4, $5, 'SCHEDULED')
       RETURNING id, shift_date, start_time, end_time, status`,
      [dto.employeeId, dto.branchId, dto.shiftDate, dto.startTime, dto.endTime]
    );

    const row = result.rows[0];
    return {
      id: parseInt(row.id, 10),
      employeeId: dto.employeeId,
      employeeName: empName,
      branchId: dto.branchId,
      shiftDate: row.shift_date,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status,
    };
  }

  async createLeaveRequest(dto: CreateLeaveRequestDto): Promise<LeaveRequestResponseDto> {
    const empRes = await pool.query('SELECT name FROM employees WHERE id = $1', [dto.employeeId]);
    const empName = empRes.rows[0]?.name || 'Employee';

    const result = await pool.query(
      `INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
       VALUES ($1, $2, $3, $4, $5, 'PENDING')
       RETURNING id, leave_type, start_date, end_date, reason, status`,
      [dto.employeeId, dto.leaveType, dto.startDate, dto.endDate, dto.reason || '']
    );

    const row = result.rows[0];
    return {
      id: parseInt(row.id, 10),
      employeeId: dto.employeeId,
      employeeName: empName,
      leaveType: row.leave_type,
      startDate: row.start_date,
      endDate: row.end_date,
      reason: row.reason,
      status: row.status,
    };
  }

  async approveLeave(leaveRequestId: number, status: 'APPROVED' | 'REJECTED', approvedByUserId: number): Promise<LeaveRequestResponseDto> {
    const result = await pool.query(
      `UPDATE leave_requests
       SET status = $2, approved_by = $3
       WHERE id = $1
       RETURNING id, employee_id, leave_type, start_date, end_date, reason, status, approved_by`,
      [leaveRequestId, status, approvedByUserId]
    );

    const row = result.rows[0];
    const empRes = await pool.query('SELECT name FROM employees WHERE id = $1', [row.employee_id]);

    return {
      id: parseInt(row.id, 10),
      employeeId: parseInt(row.employee_id, 10),
      employeeName: empRes.rows[0]?.name || 'Employee',
      leaveType: row.leave_type,
      startDate: row.start_date,
      endDate: row.end_date,
      reason: row.reason,
      status: row.status,
      approvedBy: row.approved_by ? parseInt(row.approved_by, 10) : undefined,
    };
  }

  async savePayroll(dto: CalculatePayrollDto, netPay: number, overtimeAmount: number): Promise<PayrollResponseDto> {
    const empRes = await pool.query('SELECT name FROM employees WHERE id = $1', [dto.employeeId]);
    const empName = empRes.rows[0]?.name || 'Employee';

    const result = await pool.query(
      `INSERT INTO payroll (employee_id, month_year, base_amount, overtime_amount, claims_amount, deductions_amount, net_pay, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'DRAFT')
       RETURNING id, created_at`,
      [
        dto.employeeId,
        dto.monthYear,
        dto.baseSalary,
        overtimeAmount,
        dto.transportClaims || 0,
        dto.deductions || 0,
        netPay,
      ]
    );

    return {
      id: parseInt(result.rows[0].id, 10),
      employeeId: dto.employeeId,
      employeeName: empName,
      monthYear: dto.monthYear,
      baseAmount: dto.baseSalary,
      overtimeAmount,
      claimsAmount: dto.transportClaims || 0,
      deductionsAmount: dto.deductions || 0,
      netPay,
      status: 'DRAFT',
      createdAt: result.rows[0].created_at,
    };
  }
}
