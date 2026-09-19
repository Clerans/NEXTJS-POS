import { z } from 'zod';

export const createRawMaterialSchema = z.object({
  code: z.string().min(2, 'Raw material code is required').max(50),
  name: z.string().min(2, 'Raw material name is required').max(200),
  unitId: z.number().int().positive().optional(),
  costPerUnit: z.number().min(0, 'Cost per unit must be non-negative'),
  reorderLevel: z.number().min(0).optional().default(10),
  isActive: z.boolean().optional().default(true),
});

export const updateRawMaterialSchema = z.object({
  code: z.string().min(2).max(50).optional(),
  name: z.string().min(2).max(200).optional(),
  unitId: z.number().int().positive().optional(),
  costPerUnit: z.number().min(0).optional(),
  reorderLevel: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createRawMaterialBatchSchema = z.object({
  rawMaterialId: z.number().int().positive('Raw material ID is required'),
  warehouseId: z.number().int().positive('Warehouse ID is required'),
  batchNumber: z.string().min(2, 'Batch number is required').max(100),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  unitCost: z.number().min(0, 'Unit cost must be non-negative'),
  expiryDate: z.string().optional(),
});

export const adjustRawMaterialStockSchema = z.object({
  rawMaterialId: z.number().int().positive('Raw material ID is required'),
  warehouseId: z.number().int().positive('Warehouse ID is required'),
  newQuantity: z.number().min(0, 'New quantity must be non-negative'),
  reason: z.string().max(255).optional(),
});

export type CreateRawMaterialSchema = z.infer<typeof createRawMaterialSchema>;
export type UpdateRawMaterialSchema = z.infer<typeof updateRawMaterialSchema>;
export type CreateRawMaterialBatchSchema = z.infer<typeof createRawMaterialBatchSchema>;
export type AdjustRawMaterialStockSchema = z.infer<typeof adjustRawMaterialStockSchema>;
