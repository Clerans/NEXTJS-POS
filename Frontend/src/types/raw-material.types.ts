export interface RawMaterial {
  id: number;
  name: string;
  brand: string;
  code: string;
  unitName: string;
  unitAbbr: string;
  price: number;
  status: 'Active' | 'Inactive';
}

export interface RawInventoryItem {
  id: number;
  material: string;
  brand: string;
  code: string;
  stockQty: number;
  unit: string;
  threshold: string;
  status: 'Out of Stock' | 'Over Stock' | 'In Stock';
  branch: string;
  address: string;
}
