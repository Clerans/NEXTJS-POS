export interface CreateProductDto {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: number;
  unitId: number;
  retailPrice: number;
  costPrice: number;
  isRecipeBased?: boolean;
  reorderLevel?: number;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  barcode?: string;
  categoryId?: number;
  unitId?: number;
  retailPrice?: number;
  costPrice?: number;
  isRecipeBased?: boolean;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface ProductResponseDto {
  id: number;
  sku: string;
  barcode: string | null;
  name: string;
  category: {
    id: number;
    name: string;
  };
  unit: {
    id: number;
    name: string;
    abbreviation: string;
  };
  retailPrice: number;
  costPrice: number;
  isRecipeBased: boolean;
  reorderLevel: number;
  isActive: boolean;
  createdAt: Date;
}

export interface CategoryResponseDto {
  id: number;
  name: string;
  count: string;
  productCount: number;
  status: 'Active' | 'Inactive';
  createdAt?: Date;
}

export interface CreateCategoryDto {
  name: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdateCategoryDto {
  name?: string;
  status?: 'Active' | 'Inactive';
}

export interface UnitResponseDto {
  id: number;
  icon: string;
  name: string;
  abbr: string;
  type: 'Quantity' | 'Weight' | 'Volume';
  status: 'Active' | 'Inactive';
  createdAt?: Date;
}

export interface CreateUnitDto {
  name: string;
  abbr: string;
  type?: 'Quantity' | 'Weight' | 'Volume';
  status?: 'Active' | 'Inactive';
  icon?: string;
}

export interface UpdateUnitDto {
  name?: string;
  abbr?: string;
  type?: 'Quantity' | 'Weight' | 'Volume';
  status?: 'Active' | 'Inactive';
  icon?: string;
}

