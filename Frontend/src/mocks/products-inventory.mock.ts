import { ProductInventoryItem } from '../types/product.types';

export const initialProductsInventory: ProductInventoryItem[] = [
  { id: 1, name: 'AFFOGATO', category: 'HOT COFFEE', sku: 'HAF01', stock: 'N/A', recipe: true, branch: 'Hyde Park -WH', stockStatus: 'N/A (Recipe)', prodStatus: 'Active' },
  { id: 2, name: 'AFFOGATO', category: 'HOT COFFEE', sku: 'HAF01', stock: 'N/A', recipe: true, branch: 'Malabe', stockStatus: 'N/A (Recipe)', prodStatus: 'Active' },
  { id: 3, name: 'AFFOGATO', category: 'HOT COFFEE', sku: 'HAF01', stock: 'N/A', recipe: true, branch: 'Hyde Park Corner', stockStatus: 'N/A (Recipe)', prodStatus: 'Active' },
  { id: 4, name: 'AFFOGATO', category: 'HOT COFFEE', sku: 'HAF01', stock: 'N/A', recipe: true, branch: 'Malabe -WH', stockStatus: 'N/A (Recipe)', prodStatus: 'Active' },
  { id: 5, name: 'Affogato', category: 'HOT COFFEE', sku: 'BHC-07', stock: '0 pcs', threshold: '5 pcs', recipe: false, branch: 'Malabe -WH', stockStatus: 'Out of Stock', prodStatus: 'Active' }
];
