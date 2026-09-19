export interface SaleOrder {
  id: string;
  date: string;
  customer: string;
  type: string;
  total: number;
  status: 'Completed' | 'Pending' | 'Cancelled';
  items: string[];
}
