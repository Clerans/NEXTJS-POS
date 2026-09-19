export interface CustomerReturnItemInputDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  reason: string;
}

export interface CreateCustomerReturnDto {
  orderId: number;
  branchId: number;
  items: CustomerReturnItemInputDto[];
  refundMethod: 'CASH' | 'STORE_CREDIT' | 'CARD_REFUND';
  notes?: string;
}

export interface SupplierReturnItemInputDto {
  rawMaterialId?: number;
  productId?: number;
  quantity: number;
  unitCost: number;
  reason: string;
}

export interface CreateSupplierReturnDto {
  supplierId: number;
  branchId: number;
  items: SupplierReturnItemInputDto[];
  notes?: string;
}

export interface ReturnResponseDto {
  id: number;
  returnNo: string;
  type: 'CUSTOMER_RETURN' | 'SUPPLIER_RETURN';
  referenceNo: string;
  totalRefundAmount: number;
  status: 'PROCESSED' | 'APPROVED';
  createdAt: Date;
}
