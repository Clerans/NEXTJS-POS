import { api } from './axiosInstance';
import { SaleOrder } from '@/types/sales.types';

export interface POSOrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreatePOSOrderPayload {
  branchId: number;
  customerId?: number;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'TAKE_AWAY' | 'DELIVERY';
  items: POSOrderItem[];
  discountAmount?: number;
  taxAmount?: number;
  serviceCharge?: number;
  paymentMethod: 'CASH' | 'CARD' | 'QR' | 'CREDIT';
  amountPaid: number;
  managerPin?: string;
}

export interface POSOrder {
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
  createdAt: string;
}

export interface KDSItem {
  productId: number;
  productName: string;
  quantity: number;
}

export interface KDSOrderTicket {
  orderId: number;
  orderNo: string;
  orderType: string;
  kdsStatus: 'RECEIVED' | 'PREPARING' | 'READY' | 'SERVED';
  items: KDSItem[];
  createdAt: string;
}

export const posService = {
  async getSalesOrders(search?: string, status?: string): Promise<SaleOrder[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const response = await api.get(`/pos/orders?${params.toString()}`);
    return response.data.data || response.data;
  },

  async getSalesOrderById(orderId: number | string): Promise<any> {
    const response = await api.get(`/pos/orders/${orderId}`);
    return response.data.data || response.data;
  },

  async processOrder(orderPayload: CreatePOSOrderPayload): Promise<POSOrder> {
    const response = await api.post('/pos/checkout', orderPayload);
    return response.data.data || response.data;
  },

  async voidOrder(orderId: number, reason: string, managerPin: string): Promise<boolean> {
    const response = await api.post('/pos/void', { orderId, reason, managerPin });
    return response.data.success;
  },

  async getKdsOrders(): Promise<KDSOrderTicket[]> {
    const response = await api.get('/pos/kds');
    return response.data.data || response.data;
  },

  async updateKdsOrderStatus(orderId: number | string, status: string): Promise<boolean> {
    const response = await api.patch(`/pos/kds/${orderId}/status`, { status });
    return response.data.success;
  },
};
