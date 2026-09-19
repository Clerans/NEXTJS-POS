import { api } from './axiosInstance';

export interface Branch {
  id: number;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateBranchPayload {
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateBranchPayload {
  code?: string;
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export const branchesService = {
  async getAll(): Promise<Branch[]> {
    const response = await api.get('/branches');
    return response.data.data || response.data;
  },

  async getById(id: number): Promise<Branch> {
    const response = await api.get(`/branches/${id}`);
    return response.data.data || response.data;
  },

  async create(payload: CreateBranchPayload): Promise<Branch> {
    const response = await api.post('/branches', payload);
    return response.data.data || response.data;
  },

  async update(id: number, payload: UpdateBranchPayload): Promise<Branch> {
    const response = await api.put(`/branches/${id}`, payload);
    return response.data.data || response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/branches/${id}`);
  },
};
