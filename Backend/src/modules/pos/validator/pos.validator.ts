import { z } from 'zod';

export const orderItemInputSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  unitPrice: z.number().nonnegative(),
  notes: z.string().optional(),
});

export const createPOSOrderSchema = z.object({
  branchId: z.number().int().positive(),
  orderType: z.enum(['TAKE_AWAY', 'DINE_IN', 'DELIVERY']),
  tableId: z.number().int().positive().optional(),
  customerId: z.number().int().positive().optional(),
  items: z.array(orderItemInputSchema).min(1, 'Order must contain at least 1 item'),
  discountAmount: z.number().nonnegative().optional().default(0),
  taxAmount: z.number().nonnegative().optional().default(0),
  serviceCharge: z.number().nonnegative().optional().default(0),
  paymentMethod: z.enum(['CASH', 'CARD', 'ONLINE', 'CREDIT']),
  amountPaid: z.number().nonnegative('Amount paid is required'),
  managerPin: z.string().optional(),
});

export const voidOrderSchema = z.object({
  orderId: z.number().int().positive(),
  reason: z.string().min(3, 'Void reason must be specified').max(200),
  managerPin: z.string().regex(/^\d{4,8}$/, 'Manager PIN must be a 4-8 digit numeric string'),
});

export const updateKDSStatusSchema = z.object({
  status: z.enum(['RECEIVED', 'PREPARING', 'READY', 'SERVED']),
});

export const salesQueryFilterSchema = z.object({
  search: z.string().optional(),
  branchId: z.coerce.number().optional(),
  orderType: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
});

export type CreatePOSOrderSchema = z.infer<typeof createPOSOrderSchema>;
export type VoidOrderSchema = z.infer<typeof voidOrderSchema>;
export type UpdateKDSStatusSchema = z.infer<typeof updateKDSStatusSchema>;
export type SalesQueryFilterSchema = z.infer<typeof salesQueryFilterSchema>;
