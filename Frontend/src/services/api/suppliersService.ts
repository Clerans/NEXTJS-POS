import { api } from './axiosInstance';

export interface Supplier {
  id: number;
  code: string;
  name: string;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  paymentTerms: string;
  createdAt: string;
}

export const suppliersService = {
  async getAll(): Promise<Supplier[]> {
    const response = await api.get('/suppliers');
    return response.data.data || response.data;
  },

  async create(supplierData: any): Promise<Supplier> {
    const response = await api.post('/suppliers', supplierData);
    return response.data.data || response.data;
  },
};
