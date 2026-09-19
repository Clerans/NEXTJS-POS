import { api } from './axiosInstance';
import { Unit } from '@/types/unit.types';

export interface Product {
  id: number;
  sku: string;
  barcode: string | null;
  name: string;
  category: { id: number; name: string };
  unit: { id: number; name: string; abbreviation: string };
  retailPrice: number;
  costPrice: number;
  isRecipeBased: boolean;
  reorderLevel: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  count: string;
  productCount: number;
  status: 'Active' | 'Inactive';
}

export const productsService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get('/products');
    return response.data.data || response.data;
  },

  async getById(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data.data || response.data;
  },

  async create(productData: any): Promise<Product> {
    const response = await api.post('/products', productData);
    return response.data.data || response.data;
  },

  async update(id: number, productData: any): Promise<Product> {
    const response = await api.put(`/products/${id}`, productData);
    return response.data.data || response.data;
  },

  async delete(id: number): Promise<boolean> {
    const response = await api.delete(`/products/${id}`);
    return response.data.success;
  },

  // Category methods
  async getCategories(): Promise<ProductCategory[]> {
    const response = await api.get('/products/categories');
    return response.data.data || response.data;
  },

  async createCategory(categoryData: { name: string; status?: 'Active' | 'Inactive' }): Promise<ProductCategory> {
    const response = await api.post('/products/categories', categoryData);
    return response.data.data || response.data;
  },

  async updateCategory(id: number, categoryData: { name?: string; status?: 'Active' | 'Inactive' }): Promise<ProductCategory> {
    const response = await api.put(`/products/categories/${id}`, categoryData);
    return response.data.data || response.data;
  },

  async deleteCategory(id: number): Promise<boolean> {
    const response = await api.delete(`/products/categories/${id}`);
    return response.data.success;
  },

  // Unit methods
  async getUnits(): Promise<Unit[]> {
    const response = await api.get('/products/units');
    return response.data.data || response.data;
  },

  async createUnit(unitData: { name: string; abbr: string; type?: string; status?: string; icon?: string }): Promise<Unit> {
    const response = await api.post('/products/units', unitData);
    return response.data.data || response.data;
  },

  async updateUnit(id: number, unitData: any): Promise<Unit> {
    const response = await api.put(`/products/units/${id}`, unitData);
    return response.data.data || response.data;
  },

  async deleteUnit(id: number): Promise<boolean> {
    const response = await api.delete(`/products/units/${id}`);
    return response.data.success;
  },
};
