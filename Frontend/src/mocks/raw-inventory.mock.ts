import { RawInventoryItem } from '../types/raw-material.types';

export const initialRawInventory: RawInventoryItem[] = [
  { id: 1, material: 'Almond Syrup 700ml', brand: 'Monin', code: 'RM_F_SYR_009', stockQty: 0, unit: 'ml', threshold: '1 ml', status: 'Out of Stock', branch: 'Hyde Park -WH', address: 'No.97' },
  { id: 2, material: 'Almond Syrup 700ml', brand: 'Monin', code: 'RM_F_SYR_009', stockQty: 0, unit: 'ml', threshold: '1 ml', status: 'Out of Stock', branch: 'Hyde Park Corner', address: 'No.97' },
  { id: 3, material: 'Almond Syrup 700ml', brand: 'Monin', code: 'RM_F_SYR_009', stockQty: 0, unit: 'ml', threshold: '1 ml', status: 'Out of Stock', branch: 'Malabe -WH', address: 'No.162/24/2' },
  { id: 4, material: 'Almond Syrup 700ml', brand: 'Monin', code: 'RM_F_SYR_009', stockQty: 700, unit: 'ml', threshold: '1 ml', status: 'Over Stock', branch: 'Malabe', address: 'No.162/24/2' },
  { id: 5, material: 'Apple', brand: 'Keells', code: 'FAL003', stockQty: 0, unit: 'kg', threshold: '1 kg', status: 'Out of Stock', branch: 'Hyde Park -WH', address: 'No.97' }
];
