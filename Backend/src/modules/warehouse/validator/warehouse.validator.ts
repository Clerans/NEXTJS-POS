import { z } from 'zod';

export const transferItemInputSchema = z.object({
  productId: z.number().int().positive().optional(),
  rawMaterialId: z.number().int().positive().optional(),
  quantity: z.number().positive('Quantity must be greater than 0'),
}).refine(data => data.productId || data.rawMaterialId, {
  message: 'Either productId or rawMaterialId must be specified',
});

export const createTransferSchema = z.object({
  sourceWarehouseId: z.number().int().positive('Source warehouse is required'),
  destinationWarehouseId: z.number().int().positive('Destination warehouse is required'),
  items: z.array(transferItemInputSchema).min(1, 'Transfer must contain at least 1 item'),
  notes: z.string().optional(),
}).refine(data => data.sourceWarehouseId !== data.destinationWarehouseId, {
  message: 'Source and destination warehouses cannot be the same',
});

export const updateTransferStatusSchema = z.object({
  transferId: z.number().int().positive(),
  status: z.enum(['DISPATCHED', 'RECEIVED', 'CANCELLED']),
});

export const createProductionSchema = z.object({
  productId: z.number().int().positive('Product ID is required'),
  warehouseId: z.number().int().positive('Warehouse ID is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
});

export type CreateTransferSchema = z.infer<typeof createTransferSchema>;
export type UpdateTransferStatusSchema = z.infer<typeof updateTransferStatusSchema>;
export type CreateProductionSchema = z.infer<typeof createProductionSchema>;
