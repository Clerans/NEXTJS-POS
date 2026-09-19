export interface CreateRawMaterialDto {
  code: string;
  name: string;
  unitId?: number;
  costPerUnit: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface UpdateRawMaterialDto {
  code?: string;
  name?: string;
  unitId?: number;
  costPerUnit?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface RawMaterialResponseDto {
  id: number;
  code: string;
  name: string;
  unitId: number | null;
  unitName: string | null;
  unitAbbr: string | null;
  costPerUnit: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CreateRawMaterialBatchDto {
  rawMaterialId: number;
  warehouseId: number;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  expiryDate?: string;
}

export interface RawMaterialBatchResponseDto {
  id: number;
  rawMaterialId: number;
  rawMaterialName: string | null;
  warehouseId: number;
  warehouseName: string | null;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  expiryDate: Date | null;
  createdAt: Date;
}

export interface RawMaterialInventoryResponseDto {
  id: number;
  warehouseId: number;
  warehouseName: string | null;
  rawMaterialId: number;
  rawMaterialName: string | null;
  currentStock: number;
  reorderLevel: number;
  updatedAt: Date;
}

export interface AdjustRawMaterialStockDto {
  rawMaterialId: number;
  warehouseId: number;
  newQuantity: number;
  reason?: string;
}
