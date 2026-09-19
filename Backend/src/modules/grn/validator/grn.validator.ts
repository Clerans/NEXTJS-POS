import { z } from 'zod';

export const grnItemInputSchema = z.object({
  rawMaterialId: z.number().int().positive().optional(),
  productId: z.number().int().positive().optional(),
  receivedQuantity: z.number().positive('Received quantity must be greater than 0'),
  unitCost: z.number().nonnegative('Unit cost cannot be negative'),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional(),
}).refine(data => data.rawMaterialId || data.productId, {
  message: 'Either rawMaterialId or productId must be specified',
});

export const createGRNSchema = z.object({
  purchaseOrderId: z.number().int().positive().optional(),
  supplierId: z.number().int().positive('Supplier ID is required'),
  branchId: z.number().int().positive('Branch ID is required'),
  invoiceNumber: z.string().min(2, 'Vendor Invoice Number is required'),
  items: z.array(grnItemInputSchema).min(1, 'GRN must contain at least 1 received line item'),
  notes: z.string().optional(),
});

export const recordGRNPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than 0'),
  paymentMethod: z.string().optional().default('CASH'),
  referenceNo: z.string().optional(),
});

export type CreateGRNSchema = z.infer<typeof createGRNSchema>;
export type RecordGRNPaymentSchema = z.infer<typeof recordGRNPaymentSchema>;
