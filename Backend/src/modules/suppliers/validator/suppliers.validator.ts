import { z } from 'zod';

export const createSupplierSchema = z.object({
  code: z.string().min(2, 'Supplier code is required').max(30),
  name: z.string().min(2, 'Supplier name is required').max(100),
  contactPerson: z.string().max(100).optional(),
  phone: z.string().min(7, 'Phone number is required').max(20),
  email: z.string().email('Invalid email address').optional(),
  paymentTerms: z.string().max(50).optional().default('NET 30'),
});

export const updateSupplierSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  contactPerson: z.string().max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  email: z.string().email().optional(),
  paymentTerms: z.string().max(50).optional(),
});

export type CreateSupplierSchema = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierSchema = z.infer<typeof updateSupplierSchema>;
