import { z } from 'zod';

export const createPromotionSchema = z.object({
  code: z.string().min(2, 'Promo code is required').max(30),
  name: z.string().min(2, 'Promotion title is required').max(100),
  type: z.enum(['PERCENTAGE', 'FLAT', 'BUY_X_GET_Y']),
  discountValue: z.number().positive('Discount value must be greater than 0'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date format must be YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date format must be YYYY-MM-DD'),
});

export const sendSmsCampaignSchema = z.object({
  customerGroupId: z.number().int().positive().optional(),
  messageText: z.string().min(5, 'SMS message text is required').max(160, 'SMS maximum length is 160 characters'),
});

export type CreatePromotionSchema = z.infer<typeof createPromotionSchema>;
export type SendSmsCampaignSchema = z.infer<typeof sendSmsCampaignSchema>;
