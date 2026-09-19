export interface Product {
  id: number;
  code: string;
  name: string;
  category: string;
  type: string;
  outletPrice: number;
  pickmePrice: number;
  uberPrice: number;
  price: number;
  stock: number;
  status: 'Active' | 'Inactive';
  icon?: string;
}

export interface ProductInventoryItem {
  id?: number;
  name: string;
  category: string;
  sku: string;
  stock: string;
  threshold?: string;
  recipe: boolean;
  branch: string;
  stockStatus: string;
  prodStatus: 'Active' | 'Inactive';
}
