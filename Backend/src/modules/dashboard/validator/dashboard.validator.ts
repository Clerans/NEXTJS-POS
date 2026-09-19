import { z } from 'zod';

export const salesTrendFilterSchema = z.object({
  period: z.enum(['This Week', 'This Month', 'This Year']).optional().default('This Week'),
  branchId: z.coerce.number().optional(),
});

export const ordersByTypeFilterSchema = z.object({
  period: z.enum(['Today', 'This Week', 'This Month']).optional().default('This Month'),
  branchId: z.coerce.number().optional(),
});

export const recentSalesFilterSchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional().default(5),
  branchId: z.coerce.number().optional(),
});

export const lowStockFilterSchema = z.object({
  branchId: z.coerce.number().optional(),
});
