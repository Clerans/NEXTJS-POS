import { HRRepository } from '../repository/hr.repository.js';
import {
  ClockInDto,
  ClockOutDto,
  CalculatePayrollDto,
  EmployeeResponseDto,
  AttendanceResponseDto,
  PayrollResponseDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateShiftDto,
  ShiftResponseDto,
  CreateLeaveRequestDto,
  ApproveLeaveDto,
  LeaveRequestResponseDto,
} from '../dto/hr.dto.js';
import { NotFoundError, BadRequestError } from '../../../common/errors/app-error.js';

export class HRService {
  private hrRepository: HRRepository;

  constructor() {
    this.hrRepository = new HRRepository();
  }

  async getAllEmployees(): Promise<EmployeeResponseDto[]> {
    return await this.hrRepository.findAllEmployees();
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<EmployeeResponseDto> {
    if (!dto.name || !dto.employeeCode) {
      throw new BadRequestError('Employee name and employee code are required');
    }
    return await this.hrRepository.createEmployee(dto);
  }

  async updateEmployee(dto: UpdateEmployeeDto): Promise<EmployeeResponseDto> {
    const employees = await this.hrRepository.findAllEmployees();
    const emp = employees.find((e) => e.id === dto.employeeId);
    if (!emp) {
      throw new NotFoundError(`Employee with ID ${dto.employeeId} not found`);
    }
    return await this.hrRepository.updateEmployee(dto);
  }

  async clockIn(dto: ClockInDto): Promise<AttendanceResponseDto> {
    const employees = await this.hrRepository.findAllEmployees();
    const emp = employees.find((e) => e.id === dto.employeeId);
    if (!emp) {
      throw new NotFoundError(`Employee with ID ${dto.employeeId} not found`);
    }
    return await this.hrRepository.clockIn(dto.employeeId);
  }

  async clockOut(dto: ClockOutDto): Promise<AttendanceResponseDto> {
    return await this.hrRepository.clockOut(dto.attendanceId);
  }

  async createShift(dto: CreateShiftDto): Promise<ShiftResponseDto> {
    const employees = await this.hrRepository.findAllEmployees();
    const emp = employees.find((e) => e.id === dto.employeeId);
    if (!emp) {
      throw new NotFoundError(`Employee with ID ${dto.employeeId} not found`);
    }
    return await this.hrRepository.createShift(dto);
  }

  async createLeaveRequest(dto: CreateLeaveRequestDto): Promise<LeaveRequestResponseDto> {
    const employees = await this.hrRepository.findAllEmployees();
    const emp = employees.find((e) => e.id === dto.employeeId);
    if (!emp) {
      throw new NotFoundError(`Employee with ID ${dto.employeeId} not found`);
    }
    return await this.hrRepository.createLeaveRequest(dto);
  }

  async approveLeave(dto: ApproveLeaveDto, approvedByUserId: number): Promise<LeaveRequestResponseDto> {
    return await this.hrRepository.approveLeave(dto.leaveRequestId, dto.status, approvedByUserId);
  }

  async calculatePayroll(dto: CalculatePayrollDto): Promise<PayrollResponseDto> {
    const employees = await this.hrRepository.findAllEmployees();
    const emp = employees.find((e) => e.id === dto.employeeId);
    if (!emp) {
      throw new NotFoundError(`Employee with ID ${dto.employeeId} not found`);
    }

    const hourlyBaseRate = dto.baseSalary / 160; // 160 standard working hours per month
    const overtimeAmount = Math.round((dto.overtimeHours * (hourlyBaseRate * dto.overtimeRate)) * 100) / 100;
    const claims = dto.transportClaims || 0;
    const deductions = dto.deductions || 0;

    const netPay = Math.round((dto.baseSalary + overtimeAmount + claims - deductions) * 100) / 100;
    if (netPay < 0) {
      throw new BadRequestError('Calculated Net Pay cannot be negative');
    }

    return await this.hrRepository.savePayroll(dto, netPay, overtimeAmount);
  }
}
