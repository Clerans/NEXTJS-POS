import { z } from 'zod';

export const recipeItemInputSchema = z.object({
  rawMaterialId: z.number().int().positive('Raw material ID is required'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitId: z.number().int().positive().optional(),
});

export const createRecipeSchema = z.object({
  productId: z.number().int().positive('Product ID is required'),
  name: z.string().min(2, 'Recipe name is required').max(200),
  yieldQuantity: z.number().positive().optional().default(1.0),
  instructions: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  items: z.array(recipeItemInputSchema).min(1, 'Recipe must contain at least one raw material item'),
});

export const updateRecipeSchema = z.object({
  productId: z.number().int().positive().optional(),
  name: z.string().min(2).max(200).optional(),
  yieldQuantity: z.number().positive().optional(),
  instructions: z.string().optional(),
  isActive: z.boolean().optional(),
  items: z.array(recipeItemInputSchema).optional(),
});

export type CreateRecipeSchema = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeSchema = z.infer<typeof updateRecipeSchema>;
