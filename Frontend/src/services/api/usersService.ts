import { api } from './axiosInstance';

export interface SystemUser {
  id: number;
  username: string;
  name: string;
  role: string;
  mobile?: string;
  status?: string;
  lastLogin?: string;
}

export const usersService = {
  async getAll(): Promise<SystemUser[]> {
    const response = await api.get('/users');
    return response.data.data || response.data;
  },

  async create(userData: any): Promise<SystemUser> {
    const response = await api.post('/users', userData);
    return response.data.data || response.data;
  },
};
