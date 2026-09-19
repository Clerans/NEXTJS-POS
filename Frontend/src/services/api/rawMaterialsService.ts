import { api } from './axiosInstance';

export interface RawMaterial {
  id: number;
  code: string;
  name: string;
  unitId?: number | null;
  unitName?: string | null;
  unitAbbr?: string | null;
  costPerUnit: number;
  reorderLevel: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateRawMaterialPayload {
  code: string;
  name: string;
  unitId?: number;
  costPerUnit: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface UpdateRawMaterialPayload {
  code?: string;
  name?: string;
  unitId?: number;
  costPerUnit?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface RawMaterialBatch {
  id: number;
  rawMaterialId: number;
  rawMaterialName: string | null;
  warehouseId: number;
  warehouseName: string | null;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  expiryDate: string | null;
  createdAt?: string;
}

export interface CreateRawMaterialBatchPayload {
  rawMaterialId: number;
  warehouseId: number;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  expiryDate?: string;
}

export interface RawMaterialInventoryItem {
  id: number;
  warehouseId: number;
  warehouseName: string | null;
  rawMaterialId: number;
  rawMaterialName: string | null;
  code?: string;
  unitName?: string;
  currentStock: number;
  reorderLevel: number;
  updatedAt?: string;
}

export interface AdjustRawMaterialStockPayload {
  rawMaterialId: number;
  warehouseId: number;
  newQuantity: number;
  reason?: string;
}

export const rawMaterialsService = {
  // Raw Material CRUD
  async getAll(): Promise<RawMaterial[]> {
    const response = await api.get('/raw-materials');
    return response.data.data || response.data;
  },

  async getById(id: number): Promise<RawMaterial> {
    const response = await api.get(`/raw-materials/${id}`);
    return response.data.data || response.data;
  },

  async create(payload: CreateRawMaterialPayload): Promise<RawMaterial> {
    const response = await api.post('/raw-materials', payload);
    return response.data.data || response.data;
  },

  async update(id: number, payload: UpdateRawMaterialPayload): Promise<RawMaterial> {
    const response = await api.put(`/raw-materials/${id}`, payload);
    return response.data.data || response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/raw-materials/${id}`);
  },

  // Batches
  async getBatches(rawMaterialId?: number, warehouseId?: number): Promise<RawMaterialBatch[]> {
    const params: Record<string, any> = {};
    if (rawMaterialId) params.rawMaterialId = rawMaterialId;
    if (warehouseId) params.warehouseId = warehouseId;
    const response = await api.get('/raw-materials/batches', { params });
    return response.data.data || response.data;
  },

  async createBatch(payload: CreateRawMaterialBatchPayload): Promise<RawMaterialBatch> {
    const response = await api.post('/raw-materials/batches', payload);
    return response.data.data || response.data;
  },

  // Inventory
  async getInventory(rawMaterialId?: number, warehouseId?: number): Promise<RawMaterialInventoryItem[]> {
    const params: Record<string, any> = {};
    if (rawMaterialId) params.rawMaterialId = rawMaterialId;
    if (warehouseId) params.warehouseId = warehouseId;
    const response = await api.get('/raw-materials/inventory', { params });
    return response.data.data || response.data;
  },

  async adjustStock(payload: AdjustRawMaterialStockPayload): Promise<RawMaterialInventoryItem> {
    const response = await api.post('/raw-materials/inventory/adjust', payload);
    return response.data.data || response.data;
  },
};
