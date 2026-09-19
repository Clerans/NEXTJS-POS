import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Customer name is required').max(100),
  mobile: z.string().min(7, 'Mobile phone number is required').max(20),
  email: z.string().email('Invalid email format').optional(),
  groupId: z.number().int().positive().optional().default(1),
  creditLimit: z.number().nonnegative().optional().default(0),
});

export const createCustomerGroupSchema = z.object({
  name: z.string().min(2, 'Customer group name is required').max(100),
  discountRate: z.number().min(0, 'Discount rate must be at least 0').max(100, 'Discount rate cannot exceed 100%').optional().default(0),
});

export const updateCustomerGroupSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  discountRate: z.number().min(0).max(100).optional(),
});

export type CreateCustomerSchema = z.infer<typeof createCustomerSchema>;
export type CreateCustomerGroupSchema = z.infer<typeof createCustomerGroupSchema>;
export type UpdateCustomerGroupSchema = z.infer<typeof updateCustomerGroupSchema>;
