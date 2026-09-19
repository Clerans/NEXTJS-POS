import { StockAlert } from '../types/stock-alert.types';

export const initialStockAlerts: StockAlert[] = [
  { item: 'Almond Syrup 700ml', code: 'RM_F_SYR_009', current: '0 ml', required: 'Min: 1ml', status: 'Out of Stock', branch: 'Malabe -WH' },
  { item: 'Almond Syrup 700ml', code: 'RM_F_SYR_009', current: '0 ml', required: 'Min: 1ml', status: 'Out of Stock', branch: 'Hyde Park Corner' },
  { item: 'Almond Syrup 700ml', code: 'RM_F_SYR_009', current: '0 ml', required: 'Min: 1ml', status: 'Out of Stock', branch: 'Hyde Park -WH' },
  { item: 'Apple', code: 'FAL003', current: '0 kg', required: 'Min: 1kg', status: 'Out of Stock', branch: 'Malabe' },
  { item: 'Apple', code: 'FAL003', current: '0 kg', required: 'Min: 1kg', status: 'Out of Stock', branch: 'Malabe -WH' }
];
