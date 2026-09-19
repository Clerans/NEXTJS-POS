import { z } from 'zod';

export const customerReturnItemInputSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive('Returned quantity must be at least 1'),
  unitPrice: z.number().nonnegative(),
  reason: z.string().min(3, 'Return reason is required').max(200),
});

export const createCustomerReturnSchema = z.object({
  orderId: z.number().int().positive('Original order ID is required'),
  branchId: z.number().int().positive(),
  items: z.array(customerReturnItemInputSchema).min(1, 'Return slip must contain at least 1 item'),
  refundMethod: z.enum(['CASH', 'STORE_CREDIT', 'CARD_REFUND']),
  notes: z.string().optional(),
});

export const supplierReturnItemInputSchema = z.object({
  rawMaterialId: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitCost: z.number().nonnegative(),
  reason: z.string().min(3, 'Supplier return reason is required').max(200),
});

export const createSupplierReturnSchema = z.object({
  supplierId: z.number().int().positive('Supplier ID is required'),
  branchId: z.number().int().positive(),
  items: z.array(supplierReturnItemInputSchema).min(1, 'Supplier return must contain at least 1 item'),
  notes: z.string().optional(),
});

export type CreateCustomerReturnSchema = z.infer<typeof createCustomerReturnSchema>;
export type CreateSupplierReturnSchema = z.infer<typeof createSupplierReturnSchema>;
