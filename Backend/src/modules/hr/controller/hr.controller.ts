import { Request, Response, NextFunction } from 'express';
import { HRService } from '../service/hr.service.js';
import { clockInSchema, calculatePayrollSchema } from '../validator/hr.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class HRController {
  private hrService: HRService;

  constructor() {
    this.hrService = new HRService();
  }

  getEmployees = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employees = await this.hrService.getAllEmployees();
      res.status(200).json(ApiResponse.success(employees, 'Employee roster retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await this.hrService.createEmployee(req.body);
      res.status(201).json(ApiResponse.success(employee, 'Employee profile created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const employee = await this.hrService.updateEmployee({
        employeeId: parseInt(req.params.id, 10),
        ...req.body,
      });
      res.status(200).json(ApiResponse.success(employee, 'Employee profile updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  clockIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = clockInSchema.parse(req.body);
      const attendance = await this.hrService.clockIn(validatedData);
      res.status(201).json(ApiResponse.success(attendance, 'Clock-in recorded successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  clockOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const attendance = await this.hrService.clockOut({ attendanceId: parseInt(req.body.attendanceId, 10) });
      res.status(200).json(ApiResponse.success(attendance, 'Clock-out recorded successfully'));
    } catch (error) {
      next(error);
    }
  };

  createShift = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const shift = await this.hrService.createShift(req.body);
      res.status(201).json(ApiResponse.success(shift, 'Shift scheduled successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  createLeaveRequest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const leave = await this.hrService.createLeaveRequest(req.body);
      res.status(201).json(ApiResponse.success(leave, 'Leave request submitted successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  approveLeave = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId || 1;
      const leave = await this.hrService.approveLeave(req.body, userId);
      res.status(200).json(ApiResponse.success(leave, `Leave request ${req.body.status.toLowerCase()} successfully`));
    } catch (error) {
      next(error);
    }
  };

  calculatePayroll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = calculatePayrollSchema.parse(req.body);
      const payroll = await this.hrService.calculatePayroll(validatedData);
      res.status(200).json(ApiResponse.success(payroll, 'Payroll calculated successfully'));
    } catch (error) {
      next(error);
    }
  };
}
