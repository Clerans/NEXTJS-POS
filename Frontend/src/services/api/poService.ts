import { api } from './axiosInstance';

export interface POItem {
  id: number;
  productId?: number;
  rawMaterialId?: number;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplier: { id: number; name: string };
  branchId: number;
  totalAmount: number;
  status: string;
  itemsCount: number;
  createdAt: string;
  items?: POItem[];
}

export const poService = {
  async getAll(): Promise<PurchaseOrder[]> {
    const response = await api.get('/purchase-orders');
    return response.data.data || response.data;
  },

  async getById(id: number): Promise<PurchaseOrder> {
    const response = await api.get(`/purchase-orders/${id}`);
    return response.data.data || response.data;
  },

  async create(poData: any): Promise<PurchaseOrder> {
    const response = await api.post('/purchase-orders', poData);
    return response.data.data || response.data;
  },

  async updateStatus(id: number, status: string): Promise<PurchaseOrder> {
    const response = await api.patch(`/purchase-orders/${id}/status`, { status });
    return response.data.data || response.data;
  },
};

export const purchasingService = poService;
