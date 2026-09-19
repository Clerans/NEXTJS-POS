import { api } from './axiosInstance';

export interface StockTransfer {
  id: number;
  transferNo: string;
  sourceWarehouse: { id: number; name: string };
  destinationWarehouse: { id: number; name: string };
  status: string;
  itemsCount: number;
  createdAt: string;
}

export interface ProductionItem {
  id: number;
  rawMaterialId: number;
  rawMaterialName: string | null;
  quantityConsumed: number;
  unitId?: number | null;
  unitAbbr?: string | null;
}

export interface Production {
  id: number;
  productionNo: string;
  productId: number;
  productName: string | null;
  warehouseId: number;
  warehouseName: string | null;
  recipeId: number;
  quantity: number;
  status: string;
  createdBy?: number | null;
  createdAt: string;
  completedAt?: string | null;
  items?: ProductionItem[];
}

export const warehouseService = {
  // Stock Transfer methods
  async getAllTransfers(): Promise<StockTransfer[]> {
    const response = await api.get('/warehouse/transfers');
    return response.data.data || response.data;
  },

  async createTransfer(transferData: any): Promise<StockTransfer> {
    const response = await api.post('/warehouse/transfers', transferData);
    return response.data.data || response.data;
  },

  async completeTransfer(id: number): Promise<StockTransfer> {
    const response = await api.post(`/warehouse/transfer/${id}/complete`);
    return response.data.data || response.data;
  },

  async cancelTransfer(id: number): Promise<StockTransfer> {
    const response = await api.post(`/warehouse/transfer/${id}/cancel`);
    return response.data.data || response.data;
  },

  async updateStatus(transferId: number, status: string): Promise<boolean> {
    const response = await api.patch(`/warehouse/transfers/${transferId}/status`, { status });
    return response.data.success;
  },

  // Production Order methods
  async getProductions(): Promise<Production[]> {
    const response = await api.get('/warehouse/productions');
    return response.data.data || response.data;
  },

  async getProductionById(id: number): Promise<Production> {
    const response = await api.get(`/warehouse/productions/${id}`);
    return response.data.data || response.data;
  },

  async createProduction(productionData: { productId: number; warehouseId: number; quantity: number }): Promise<Production> {
    const response = await api.post('/warehouse/productions', productionData);
    return response.data.data || response.data;
  },

  async completeProduction(id: number): Promise<Production> {
    const response = await api.post(`/warehouse/productions/${id}/complete`);
    return response.data.data || response.data;
  },

  async cancelProduction(id: number): Promise<Production> {
    const response = await api.post(`/warehouse/productions/${id}/cancel`);
    return response.data.data || response.data;
  },
};
