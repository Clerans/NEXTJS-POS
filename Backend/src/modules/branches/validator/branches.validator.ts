import { z } from 'zod';

export const createBranchSchema = z.object({
  code: z.string().min(2, 'Branch code is required').max(50),
  name: z.string().min(2, 'Branch name is required').max(150),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateBranchSchema = z.object({
  code: z.string().min(2).max(50).optional(),
  name: z.string().min(2).max(150).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateBranchSchema = z.infer<typeof createBranchSchema>;
export type UpdateBranchSchema = z.infer<typeof updateBranchSchema>;
