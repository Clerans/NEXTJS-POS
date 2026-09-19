import { z } from 'zod';

export const poItemInputSchema = z.object({
  rawMaterialId: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitCost: z.number().nonnegative('Unit cost cannot be negative'),
}).refine(data => data.rawMaterialId || data.productId, {
  message: 'Either rawMaterialId or productId must be specified',
});

export const createPOSchema = z.object({
  supplierId: z.number().int().positive('Supplier ID is required'),
  branchId: z.number().int().positive('Branch ID is required'),
  expectedDeliveryDate: z.string().optional(),
  items: z.array(poItemInputSchema).min(1, 'Purchase Order must contain at least 1 item'),
  notes: z.string().optional(),
});

export const approvePOSchema = z.object({
  poId: z.number().int().positive(),
  managerPin: z.string().optional(),
});

export const updatePOStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'CANCELLED', 'CLOSED']),
  reason: z.string().optional(),
});

export type CreatePOSchema = z.infer<typeof createPOSchema>;
export type ApprovePOSchema = z.infer<typeof approvePOSchema>;
export type UpdatePOStatusSchema = z.infer<typeof updatePOStatusSchema>;
