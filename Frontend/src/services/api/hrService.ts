import { api } from './axiosInstance';

export interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  jobTitle?: string;
  role?: string;
  branch?: string;
  branchName?: string;
  mobile: string;
  employmentStatus?: string;
  hiredDate?: string;
}

export interface CreateEmployeePayload {
  employeeCode: string;
  name: string;
  jobTitle?: string;
  branchId?: number;
  mobile: string;
  employmentStatus?: string;
}

export interface CreateShiftPayload {
  employeeId: number;
  shiftName: string;
  startTime: string;
  endTime: string;
  date: string;
}

export interface CreateLeaveRequestPayload {
  employeeId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface ApproveLeavePayload {
  leaveRequestId: number;
  status: 'APPROVED' | 'REJECTED';
}

export interface CalculatePayrollPayload {
  employeeId: number;
  month: string;
  baseSalary: number;
  allowances?: number;
  deductions?: number;
}

export const hrService = {
  // Employees
  async getEmployees(): Promise<Employee[]> {
    const response = await api.get('/hr/employees');
    return response.data.data || response.data;
  },

  async createEmployee(payload: CreateEmployeePayload): Promise<Employee> {
    const response = await api.post('/hr/employees', payload);
    return response.data.data || response.data;
  },

  async updateEmployee(id: number, payload: Partial<CreateEmployeePayload>): Promise<Employee> {
    const response = await api.put(`/hr/employees/${id}`, payload);
    return response.data.data || response.data;
  },

  // Attendance
  async clockIn(employeeId: number): Promise<any> {
    const response = await api.post('/hr/attendance/clock-in', { employeeId });
    return response.data.data || response.data;
  },

  async clockOut(attendanceId: number): Promise<any> {
    const response = await api.post('/hr/attendance/clock-out', { attendanceId });
    return response.data.data || response.data;
  },

  // Shifts
  async createShift(payload: CreateShiftPayload): Promise<any> {
    const response = await api.post('/hr/shifts', payload);
    return response.data.data || response.data;
  },

  // Leave Management
  async createLeaveRequest(payload: CreateLeaveRequestPayload): Promise<any> {
    const response = await api.post('/hr/leave/request', payload);
    return response.data.data || response.data;
  },

  async approveLeave(payload: ApproveLeavePayload): Promise<any> {
    const response = await api.post('/hr/leave/approve', payload);
    return response.data.data || response.data;
  },

  // Payroll
  async calculatePayroll(payload: CalculatePayrollPayload): Promise<any> {
    const response = await api.post('/hr/payroll/calculate', payload);
    return response.data.data || response.data;
  },
};
