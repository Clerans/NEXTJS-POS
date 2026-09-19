export interface GRNItemInputDto {
  rawMaterialId?: number;
  productId?: number;
  receivedQuantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface CreateGRNDto {
  purchaseOrderId?: number;
  supplierId: number;
  branchId: number;
  warehouseId?: number;
  invoiceNumber: string;
  items: GRNItemInputDto[];
  allowOverReceiving?: boolean;
  notes?: string;
}

export interface RecordGRNPaymentDto {
  amount: number;
  paymentMethod?: string;
  referenceNo?: string;
  userId?: number;
}

export interface GRNResponseDto {
  id: number;
  grnNumber: string;
  purchaseOrderId: number | null;
  supplierId: number;
  supplierName: string;
  branchId: number;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  dueBalance: number;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  status: string;
  createdAt: Date;
}
