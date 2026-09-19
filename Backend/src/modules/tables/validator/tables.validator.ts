import { z } from 'zod';

export const createDiningTableSchema = z.object({
  branchId: z.number().int().positive('Branch ID is required'),
  tableNumber: z.string().min(1, 'Table number is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').optional().default(4),
  availability: z.enum(['AVAILABLE', 'OCCUPIED']).optional().default('AVAILABLE'),
  isActive: z.boolean().optional().default(true),
});

export const updateDiningTableSchema = z.object({
  branchId: z.number().int().positive().optional(),
  tableNumber: z.string().min(1).optional(),
  capacity: z.number().int().min(1).optional(),
  availability: z.enum(['AVAILABLE', 'OCCUPIED']).optional(),
  isActive: z.boolean().optional(),
});

export const updateTableAvailabilitySchema = z.object({
  availability: z.enum(['AVAILABLE', 'OCCUPIED']),
});
