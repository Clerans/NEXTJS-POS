import { api } from './axiosInstance';

export interface RecipeItem {
  id?: number;
  rawMaterialId: number;
  rawMaterialName?: string | null;
  quantity: number;
  unitId?: number | null;
  unitName?: string | null;
  unitAbbr?: string | null;
}

export interface Recipe {
  id: number;
  productId: number;
  productName: string | null;
  name: string;
  yieldQuantity: number;
  instructions: string | null;
  isActive: boolean;
  createdAt?: string;
  items: RecipeItem[];
}

export interface CreateRecipePayload {
  productId: number;
  name: string;
  yieldQuantity?: number;
  instructions?: string;
  isActive?: boolean;
  items: {
    rawMaterialId: number;
    quantity: number;
    unitId?: number;
  }[];
}

export interface UpdateRecipePayload {
  productId?: number;
  name?: string;
  yieldQuantity?: number;
  instructions?: string;
  isActive?: boolean;
  items?: {
    rawMaterialId: number;
    quantity: number;
    unitId?: number;
  }[];
}

export const recipesService = {
  async getAll(): Promise<Recipe[]> {
    const response = await api.get('/recipes');
    return response.data.data || response.data;
  },

  async getByProductId(productId: number): Promise<Recipe> {
    const response = await api.get(`/recipes/product/${productId}`);
    return response.data.data || response.data;
  },

  async getById(id: number): Promise<Recipe> {
    const response = await api.get(`/recipes/${id}`);
    return response.data.data || response.data;
  },

  async create(payload: CreateRecipePayload): Promise<Recipe> {
    const response = await api.post('/recipes', payload);
    return response.data.data || response.data;
  },

  async update(id: number, payload: UpdateRecipePayload): Promise<Recipe> {
    const response = await api.put(`/recipes/${id}`, payload);
    return response.data.data || response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/recipes/${id}`);
  },
};
