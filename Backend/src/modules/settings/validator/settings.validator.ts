import { z } from 'zod';

export const updateSettingsSchema = z.object({
  storeName: z.string().min(2).max(100).optional(),
  receiptHeader: z.string().max(250).optional(),
  receiptFooter: z.string().max(250).optional(),
  taxPercentage: z.number().nonnegative().max(100).optional(),
  currencySymbol: z.string().max(10).optional(),
  isNegativeStockAllowed: z.boolean().optional(),
});

export type UpdateSettingsSchema = z.infer<typeof updateSettingsSchema>;
