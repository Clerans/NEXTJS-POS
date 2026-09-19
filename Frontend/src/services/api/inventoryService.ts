import { api } from './axiosInstance';

export interface StockLevel {
  productId?: number;
  productName: string;
  category?: string;
  skuOrCode: string;
  currentStock: number;
  reorderLevel: number;
  branch?: string;
  branchName?: string;
  status: 'NORMAL' | 'LOW' | 'OUT_OF_STOCK';
  prodStatus?: 'Active' | 'Inactive';
  rawMaterialId?: number;
}

export interface InventoryLedgerEntry {
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
  createdAt: string;
}

export const inventoryService = {
  async getStockLevels(branchFilter: string = 'All'): Promise<StockLevel[]> {
    const response = await api.get(`/inventory/stock-levels?branchId=${encodeURIComponent(branchFilter)}`);
    return response.data.data || response.data;
  },

  async getLedgerEntries(): Promise<InventoryLedgerEntry[]> {
    const response = await api.get('/inventory/ledger');
    return response.data.data || response.data;
  },

  async adjustStock(data: {
    productId?: number;
    rawMaterialId?: number;
    batchId?: number;
    branchId: number;
    quantityChange: number;
    unitCost?: number;
    transactionType: string;
    referenceId: string;
  }): Promise<InventoryLedgerEntry> {
    const response = await api.post('/inventory/adjust', data);
    return response.data.data || response.data;
  },

  async toggleProductStatus(productId: number): Promise<{ isActive: boolean }> {
    const response = await api.put(`/inventory/toggle/${productId}`);
    return response.data.data || response.data;
  },

  async deleteInventoryItem(productId: number): Promise<boolean> {
    const response = await api.delete(`/inventory/${productId}`);
    return response.data.success;
  },

  async getAlerts(branchFilter: string = 'All'): Promise<any[]> {
    const response = await api.get(`/inventory/alerts?branchId=${encodeURIComponent(branchFilter)}`);
    return response.data.data || response.data;
  },
};
