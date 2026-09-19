import { SaleOrder } from '../types/sales.types';

export const initialSales: SaleOrder[] = [
  { id: 'ORD-1001', date: 'Aug 01, 2026', customer: 'Walk-in Customer', type: 'Take Away', total: 1900, status: 'Completed', items: ['Cappuccino x2', 'Croissant x1'] },
  { id: 'ORD-1002', date: 'Aug 01, 2026', customer: 'Amal Jayasuriya', type: 'Dine-In', total: 2500, status: 'Completed', items: ['Chicken Sandwich x2'] }
];
