export interface OrderItemInputDto {
  productId: number;
  quantity: number;
  unitPrice?: number;
  notes?: string;
}

export interface CreatePOSOrderDto {
  branchId: number;
  orderType: 'TAKE_AWAY' | 'DINE_IN' | 'DELIVERY';
  tableId?: number;
  customerId?: number;
  offlineRef?: string;
  items: OrderItemInputDto[];
  discountAmount?: number;
  taxAmount?: number;
  serviceCharge?: number;
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE' | 'CREDIT';
  amountPaid: number;
  managerPin?: string;
}

export interface VoidOrderDto {
  orderId: number;
  reason: string;
  managerPin: string;
}

export interface UpdateKDSStatusDto {
  status: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED';
}

export interface KDSItemDto {
  productId: number;
  productName: string;
  quantity: number;
}

export interface KDSOrderTicketDto {
  orderId: number;
  orderNo: string;
  orderType: string;
  kdsStatus: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED';
  items: KDSItemDto[];
  createdAt: Date;
}

export interface POSOrderResponseDto {
  orderId: number;
  orderNo: string;
  branchId: number;
  orderType: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  paymentMethod: string;
  changeGiven: number;
  status: string;
  createdAt: Date;
}
