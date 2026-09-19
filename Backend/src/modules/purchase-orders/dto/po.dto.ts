export interface POItemInputDto {
  rawMaterialId?: number;
  productId?: number;
  quantity: number;
  unitCost: number;
}

export interface CreatePODto {
  supplierId: number;
  branchId: number;
  expectedDeliveryDate?: string;
  items: POItemInputDto[];
  notes?: string;
}

export interface ApprovePODto {
  poId: number;
  managerPin?: string;
}

export interface UpdatePOStatusDto {
  status: 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CLOSED';
  reason?: string;
}

export interface POResponseDto {
  id: number;
  poNumber: string;
  supplier: {
    id: number;
    name: string;
  };
  branchId: number;
  totalAmount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PARTIALLY_RECEIVED' | 'FULLY_RECEIVED' | 'SENT' | 'CLOSED' | 'CANCELLED';
  itemsCount: number;
  createdAt: Date;
  items?: Array<{
    id: number;
    productId?: number;
    rawMaterialId?: number;
    quantity: number;
    receivedQuantity: number;
    unitCost: number;
    totalCost: number;
  }>;
}
