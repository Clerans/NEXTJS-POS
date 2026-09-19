import { z } from 'zod';

export const createVipRoomSchema = z.object({
  branchId: z.number().int().positive('Branch ID is required'),
  name: z.string().min(1, 'Room name is required'),
  category: z.enum(['Small', 'Medium', 'Large']).optional().default('Medium'),
  hourlyRate: z.number().min(0, 'Hourly rate must be non-negative'),
  discountPercentage: z.number().min(0).max(100).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const updateVipRoomSchema = z.object({
  branchId: z.number().int().positive().optional(),
  name: z.string().min(1).optional(),
  category: z.enum(['Small', 'Medium', 'Large']).optional(),
  hourlyRate: z.number().min(0).optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
});
