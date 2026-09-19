import { z } from 'zod';

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  roleId: z.number().int().positive(),
  branchIds: z.array(z.number().int().positive()).optional(),
  pinCode: z.string().regex(/^\d{4,8}$/, 'PIN must be a 4-8 digit numeric string').optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true }).extend({
  isActive: z.boolean().optional(),
});

export type CreateUserSchema = z.infer<typeof createUserSchema>;
export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
