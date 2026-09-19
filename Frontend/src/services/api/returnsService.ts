import { api } from './axiosInstance';

export interface ReturnRecord {
  id: number;
  returnNo: string;
  type: 'CUSTOMER_RETURN' | 'SUPPLIER_RETURN' | string;
  referenceNo: string;
  totalRefundAmount: number;
  status: string;
  createdAt: string;
}

export interface CustomerReturnItemPayload {
  productId: number;
  quantity: number;
  unitPrice: number;
  reason: string;
}

export interface CreateCustomerReturnPayload {
  orderId: number;
  branchId: number;
  items: CustomerReturnItemPayload[];
  refundMethod: 'CASH' | 'STORE_CREDIT' | 'CARD_REFUND';
  notes?: string;
}

export interface SupplierReturnItemPayload {
  rawMaterialId?: number;
  productId?: number;
  quantity: number;
  unitCost: number;
  reason: string;
}

export interface CreateSupplierReturnPayload {
  supplierId: number;
  branchId: number;
  items: SupplierReturnItemPayload[];
  notes?: string;
}

export const returnsService = {
  async getAll(): Promise<ReturnRecord[]> {
    const response = await api.get('/returns');
    return response.data.data || response.data;
  },

  async createCustomerReturn(returnData: CreateCustomerReturnPayload): Promise<ReturnRecord> {
    const response = await api.post('/returns/customer', returnData);
    return response.data.data || response.data;
  },

  async createSupplierReturn(returnData: CreateSupplierReturnPayload): Promise<ReturnRecord> {
    const response = await api.post('/returns/supplier', returnData);
    return response.data.data || response.data;
  },
};
