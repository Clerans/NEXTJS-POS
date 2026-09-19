export interface AdjustStockDto {
  branchId: number;
  productId?: number;
  rawMaterialId?: number;
  batchId?: number;
  transactionType: string;
  quantityChange: number;
  unitCost?: number;
  referenceId: string;
  reason?: string;
}

export interface StockLevelResponseDto {
  productId?: number;
  productName?: string;
  category?: string;
  rawMaterialId?: number;
  rawMaterialName?: string;
  skuOrCode: string;
  currentStock: number;
  reorderLevel: number;
  branch?: string;
  branchName?: string;
  status: 'NORMAL' | 'LOW' | 'OUT_OF_STOCK';
  prodStatus?: 'Active' | 'Inactive';
}

export interface InventoryLedgerEntryDto {
  id: number;
  branchId: number;
  productId?: number;
  rawMaterialId?: number;
  batchId?: number;
  transactionType: string;
  referenceId: string;
  quantityChange: number;
  balanceAfter: number;
  unitCost: number;
  createdBy: number;
  createdAt: Date;
}

export interface StockInRequestDto {
  branchId: number;
  warehouseId?: number;
  productId?: number;
  rawMaterialId?: number;
  batchId?: number;
  quantity: number;
  unitCost?: number;
  transactionType: 'PURCHASE' | 'GRN' | 'OPENING_STOCK' | 'STOCK_ADJUSTMENT_IN' | 'CUSTOMER_RETURN' | 'TRANSFER_IN' | 'POS_VOID_RETURN' | 'TRANSFER_CANCEL_RETURN';
  referenceId: string;
  userId: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface StockOutRequestDto {
  branchId: number;
  warehouseId?: number;
  productId?: number;
  rawMaterialId?: number;
  batchId?: number;
  quantity: number;
  transactionType: 'POS_SALE' | 'SUPPLIER_RETURN' | 'WASTAGE' | 'STOCK_ADJUSTMENT_OUT' | 'TRANSFER_OUT';
  referenceId: string;
  userId: number;
}

export interface TransferItemDto {
  productId?: number;
  rawMaterialId?: number;
  quantity: number;
}

export interface StockTransferRequestDto {
  sourceWarehouseId: number;
  destinationWarehouseId: number;
  transferNo: string;
  userId: number;
  items: TransferItemDto[];
}

export interface AdjustmentItemDto {
  productId?: number;
  rawMaterialId?: number;
  newQuantity: number;
  unitCost?: number;
}

export interface CreateStockAdjustmentDto {
  branchId: number;
  warehouseId?: number;
  reason: string;
  userId: number;
  items: AdjustmentItemDto[];
}

export interface StockAlertItemDto {
  type: 'PRODUCT' | 'RAW_MATERIAL';
  id: number;
  code: string;
  name: string;
  currentStock: number;
  reorderLevel: number;
  alertType: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'EXPIRING_SOON';
  expiryDate?: Date;
}
