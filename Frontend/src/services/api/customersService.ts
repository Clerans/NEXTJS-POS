import { api } from './axiosInstance';

export interface Customer {
  id: number;
  customerCode: string;
  name: string;
  mobile: string;
  email: string | null;
  groupId: number;
  groupName: string;
  loyaltyPoints: number;
  outstandingBalance: number;
  creditLimit: number;
  createdAt: string;
}

export interface CustomerGroup {
  id: number;
  name: string;
  discountRate: number;
}

export const customersService = {
  async getAll(): Promise<Customer[]> {
    const response = await api.get('/customers');
    return response.data.data || response.data;
  },

  async create(customerData: any): Promise<Customer> {
    const response = await api.post('/customers', customerData);
    return response.data.data || response.data;
  },

  async getGroups(): Promise<CustomerGroup[]> {
    const response = await api.get('/customers/groups');
    return response.data.data || response.data;
  },

  async createGroup(groupData: { name: string; discountRate?: number }): Promise<CustomerGroup> {
    const response = await api.post('/customers/groups', groupData);
    return response.data.data || response.data;
  },

  async updateGroup(id: number, groupData: { name?: string; discountRate?: number }): Promise<CustomerGroup> {
    const response = await api.put(`/customers/groups/${id}`, groupData);
    return response.data.data || response.data;
  },

  async deleteGroup(id: number): Promise<void> {
    await api.delete(`/customers/groups/${id}`);
  },
};
