export interface CreateEmployeeDto {
  employeeCode: string;
  name: string;
  jobTitle: string;
  branchId?: number;
  branch?: string;
  mobile: string;
  employmentStatus?: 'ACTIVE' | 'PROBATION' | 'TERMINATED';
  hiredDate?: string;
  baseSalary?: number;
}

export interface UpdateEmployeeDto {
  employeeId: number;
  name?: string;
  jobTitle?: string;
  branchId?: number;
  branch?: string;
  mobile?: string;
  employmentStatus?: 'ACTIVE' | 'PROBATION' | 'TERMINATED';
  baseSalary?: number;
}

export interface ClockInDto {
  employeeId: number;
}

export interface ClockOutDto {
  attendanceId: number;
}

export interface CreateShiftDto {
  employeeId: number;
  branchId: number;
  shiftDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
}

export interface ShiftResponseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  branchId: number;
  shiftDate: string;
  startTime: string;
  endTime: string;
  status: string;
}

export interface CreateLeaveRequestDto {
  employeeId: number;
  leaveType: 'ANNUAL' | 'CASUAL' | 'MEDICAL';
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface ApproveLeaveDto {
  leaveRequestId: number;
  status: 'APPROVED' | 'REJECTED';
}

export interface LeaveRequestResponseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  approvedBy?: number;
}

export interface CalculatePayrollDto {
  employeeId: number;
  monthYear: string; // YYYY-MM format
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  transportClaims?: number;
  deductions?: number;
}

export interface EmployeeResponseDto {
  id: number;
  employeeCode: string;
  name: string;
  jobTitle: string;
  branchId: number;
  branch: string;
  branchName?: string;
  mobile: string;
  employmentStatus: 'ACTIVE' | 'PROBATION' | 'TERMINATED';
  hiredDate: Date;
  baseSalary?: number;
}

export interface AttendanceResponseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  clockIn: Date;
  clockOut: Date | null;
  overtimeHours: number;
  lateMinutes?: number;
}

export interface PayrollResponseDto {
  id: number;
  employeeId: number;
  employeeName: string;
  monthYear: string;
  baseAmount: number;
  overtimeAmount: number;
  claimsAmount: number;
  deductionsAmount: number;
  netPay: number;
  status: 'DRAFT' | 'FINALIZED';
  createdAt: Date;
}
