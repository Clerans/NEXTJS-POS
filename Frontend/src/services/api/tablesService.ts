import { api } from './axiosInstance';

export interface DiningTable {
  id: number;
  branchId: number;
  branchName?: string | null;
  tableNumber: string;
  capacity: number;
  availability: 'AVAILABLE' | 'OCCUPIED';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDiningTablePayload {
  branchId: number;
  tableNumber: string;
  capacity?: number;
  availability?: 'AVAILABLE' | 'OCCUPIED';
  isActive?: boolean;
}

export interface UpdateDiningTablePayload {
  branchId?: number;
  tableNumber?: string;
  capacity?: number;
  availability?: 'AVAILABLE' | 'OCCUPIED';
  isActive?: boolean;
}

export const tablesService = {
  async getAll(branchId?: number): Promise<DiningTable[]> {
    const params = branchId ? { branchId } : {};
    const response = await api.get('/tables', { params });
    return response.data.data || response.data;
  },

  async getById(id: number): Promise<DiningTable> {
    const response = await api.get(`/tables/${id}`);
    return response.data.data || response.data;
  },

  async create(payload: CreateDiningTablePayload): Promise<DiningTable> {
    const response = await api.post('/tables', payload);
    return response.data.data || response.data;
  },

  async update(id: number, payload: UpdateDiningTablePayload): Promise<DiningTable> {
    const response = await api.put(`/tables/${id}`, payload);
    return response.data.data || response.data;
  },

  async updateAvailability(id: number, availability: 'AVAILABLE' | 'OCCUPIED'): Promise<DiningTable> {
    const response = await api.patch(`/tables/${id}/availability`, { availability });
    return response.data.data || response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/tables/${id}`);
  },
};
