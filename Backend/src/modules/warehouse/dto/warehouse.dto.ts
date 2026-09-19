export interface TransferItemInputDto {
  productId?: number;
  rawMaterialId?: number;
  quantity: number;
}

export interface CreateTransferDto {
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  items: TransferItemInputDto[];
  notes?: string;
}

export interface UpdateTransferStatusDto {
  transferId: number;
  status: 'IN_TRANSIT' | 'DISPATCHED' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED';
  receivedQuantities?: Array<{
    productId?: number;
    rawMaterialId?: number;
    receivedQuantity: number;
  }>;
}

export interface TransferResponseDto {
  id: number;
  transferNo: string;
  sourceWarehouse: { id: number; name: string };
  destinationWarehouse: { id: number; name: string };
  status: 'REQUESTED' | 'IN_TRANSIT' | 'DISPATCHED' | 'RECEIVED' | 'COMPLETED' | 'CANCELLED';
  itemsCount: number;
  createdAt: Date;
}

export interface CreateProductionDto {
  productId: number;
  warehouseId: number;
  quantity: number;
}

export interface ProductionItemResponseDto {
  id: number;
  rawMaterialId: number;
  rawMaterialName: string | null;
  quantityConsumed: number;
  unitId?: number | null;
  unitAbbr?: string | null;
}

export interface ProductionResponseDto {
  id: number;
  productionNo: string;
  productId: number;
  productName: string | null;
  warehouseId: number;
  warehouseName: string | null;
  recipeId: number;
  quantity: number;
  status: 'DRAFT' | 'COMPLETED' | 'CANCELLED';
  createdBy?: number | null;
  createdAt: Date;
  completedAt?: Date | null;
  items?: ProductionItemResponseDto[];
}
