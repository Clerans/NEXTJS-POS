import { z } from 'zod';

export const adjustStockSchema = z.object({
  branchId: z.number().int().positive('Branch ID is required'),
  productId: z.number().int().positive().optional(),
  rawMaterialId: z.number().int().positive().optional(),
  batchId: z.number().int().positive().optional(),
  transactionType: z.enum([
    'SALE',
    'PURCHASE_GRN',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'RECIPE_CONSUMPTION',
    'SPOILAGE',
    'ADJUSTMENT',
  ]),
  quantityChange: z.number().refine(val => val !== 0, { message: 'Quantity change cannot be 0' }),
  unitCost: z.number().nonnegative('Unit cost cannot be negative'),
  referenceId: z.string().min(1, 'Reference ID is required').max(100),
  reason: z.string().optional(),
}).refine(data => data.productId || data.rawMaterialId, {
  message: 'Either productId or rawMaterialId must be specified',
});

export type AdjustStockSchema = z.infer<typeof adjustStockSchema>;
