import { Product } from '../types/product.types';

export const initialProducts: Product[] = [
  { id: 1, code: 'BI020', name: 'BRIOCHE FISH BUN', category: 'Savory Items', type: 'Product', outletPrice: 590, pickmePrice: 0, uberPrice: 0, price: 590, stock: 120, status: 'Active', icon: 'sandwich' },
  { id: 2, code: 'BI019', name: 'Submarine Brioche', category: 'Bread', type: 'Product', outletPrice: 0, pickmePrice: 0, uberPrice: 0, price: 0, stock: 45, status: 'Active', icon: 'sandwich' },
  { id: 3, code: 'BI018', name: 'Japanese Milk Bread', category: 'Bread', type: 'Product', outletPrice: 650, pickmePrice: 0, uberPrice: 0, price: 650, stock: 80, status: 'Active', icon: 'bread' },
  { id: 4, code: 'BEV001', name: 'Cappuccino', category: 'Beverages', type: 'Product', outletPrice: 650, pickmePrice: 720, uberPrice: 750, price: 650, stock: 150, status: 'Active', icon: 'coffee' },
  { id: 5, code: 'BEV002', name: 'Iced Latte', category: 'Beverages', type: 'Product', outletPrice: 720, pickmePrice: 800, uberPrice: 820, price: 720, stock: 95, status: 'Active', icon: 'cup-soda' }
];
