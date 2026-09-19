import { api } from './axiosInstance';

export interface GRN {
  id: number;
  grnNumber: string;
  purchaseOrderId: number | null;
  supplierId: number;
  supplierName: string;
  branchId: number;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount?: number;
  dueBalance?: number;
  paymentStatus?: 'UNPAID' | 'PARTIAL' | 'PAID';
  status: string;
  createdAt: string;
}

export interface RecordGRNPaymentPayload {
  amount: number;
  paymentMethod?: string;
  referenceNo?: string;
}

export const grnService = {
  async getAll(): Promise<GRN[]> {
    const response = await api.get('/grn');
    return response.data.data || response.data;
  },

  async create(grnData: any): Promise<GRN> {
    const response = await api.post('/grn', grnData);
    return response.data.data || response.data;
  },

  async recordPayment(id: number, paymentData: RecordGRNPaymentPayload): Promise<GRN> {
    const response = await api.post(`/grn/${id}/payment`, paymentData);
    return response.data.data || response.data;
  },
};
