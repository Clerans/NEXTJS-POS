import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200).trim(),
  sku: z.string().min(2, 'SKU must be at least 2 characters').max(50).trim(),
  barcode: z.string().max(100).optional(),
  categoryId: z.number().int().positive('Category ID is required'),
  unitId: z.number().int().positive('Unit ID is required'),
  retailPrice: z.number().nonnegative('Retail price cannot be negative'),
  costPrice: z.number().nonnegative('Cost price cannot be negative'),
  isRecipeBased: z.boolean().optional().default(false),
  reorderLevel: z.number().nonnegative().optional().default(10),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(100).trim(),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createUnitSchema = z.object({
  name: z.string().min(1, 'Unit name is required').max(50).trim(),
  abbr: z.string().min(1, 'Abbreviation is required').max(20).trim(),
  type: z.enum(['Quantity', 'Weight', 'Volume']).optional().default('Quantity'),
  status: z.enum(['Active', 'Inactive']).optional().default('Active'),
  icon: z.string().optional(),
});

export const updateUnitSchema = createUnitSchema.partial();

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;
export type UpdateCategorySchema = z.infer<typeof updateCategorySchema>;
export type CreateUnitSchema = z.infer<typeof createUnitSchema>;
export type UpdateUnitSchema = z.infer<typeof updateUnitSchema>;
