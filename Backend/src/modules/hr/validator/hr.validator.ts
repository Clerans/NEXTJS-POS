import { z } from 'zod';

export const clockInSchema = z.object({
  employeeId: z.number().int().positive('Employee ID is required'),
});

export const clockOutSchema = z.object({
  attendanceId: z.number().int().positive('Attendance ID is required'),
});

export const calculatePayrollSchema = z.object({
  employeeId: z.number().int().positive('Employee ID is required'),
  monthYear: z.string().regex(/^\d{4}-\d{2}$/, 'Month-Year format must be YYYY-MM'),
  baseSalary: z.number().nonnegative('Base salary cannot be negative'),
  overtimeHours: z.number().nonnegative().optional().default(0),
  overtimeRate: z.number().nonnegative().optional().default(1.5),
  transportClaims: z.number().nonnegative().optional().default(0),
  deductions: z.number().nonnegative().optional().default(0),
});

export type ClockInSchema = z.infer<typeof clockInSchema>;
export type ClockOutSchema = z.infer<typeof clockOutSchema>;
export type CalculatePayrollSchema = z.infer<typeof calculatePayrollSchema>;
