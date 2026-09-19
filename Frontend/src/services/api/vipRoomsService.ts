import { api } from './axiosInstance';

export interface VipRoom {
  id: number;
  branchId: number;
  branchName?: string | null;
  name: string;
  category: 'Small' | 'Medium' | 'Large';
  hourlyRate: number;
  discountPercentage: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVipRoomPayload {
  branchId: number;
  name: string;
  category?: 'Small' | 'Medium' | 'Large';
  hourlyRate: number;
  discountPercentage?: number;
  isActive?: boolean;
}

export interface UpdateVipRoomPayload {
  branchId?: number;
  name?: string;
  category?: 'Small' | 'Medium' | 'Large';
  hourlyRate?: number;
  discountPercentage?: number;
  isActive?: boolean;
}

export const vipRoomsService = {
  async getAll(branchId?: number): Promise<VipRoom[]> {
    const params = branchId ? { branchId } : {};
    const response = await api.get('/vip-rooms', { params });
    return response.data.data || response.data;
  },

  async getById(id: number): Promise<VipRoom> {
    const response = await api.get(`/vip-rooms/${id}`);
    return response.data.data || response.data;
  },

  async create(payload: CreateVipRoomPayload): Promise<VipRoom> {
    const response = await api.post('/vip-rooms', payload);
    return response.data.data || response.data;
  },

  async update(id: number, payload: UpdateVipRoomPayload): Promise<VipRoom> {
    const response = await api.put(`/vip-rooms/${id}`, payload);
    return response.data.data || response.data;
  },

  async updateStatus(id: number, isActive: boolean): Promise<VipRoom> {
    const response = await api.patch(`/vip-rooms/${id}/status`, { isActive });
    return response.data.data || response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/vip-rooms/${id}`);
  },
};
