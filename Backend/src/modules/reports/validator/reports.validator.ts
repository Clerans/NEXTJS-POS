import { z } from 'zod';

export const reportFilterSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD').optional(),
  branchId: z.coerce.number().int().positive().optional(),
  format: z.enum(['json', 'csv', 'pdf']).optional().default('json'),
});

export type ReportFilterSchema = z.infer<typeof reportFilterSchema>;
