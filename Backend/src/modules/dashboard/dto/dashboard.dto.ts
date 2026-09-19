export interface DashboardMetricsDTO {
  totalSales: number;
  activeCustomers: number;
  monthlyGrowth: number;
  totalOrders: number;
}

export interface SalesTrendDataPoint {
  day: string;
  sales: number;
}

export interface OrdersByTypeDTO {
  takeawayCount: number;
  takeawayPercentage: number;
  dineInCount: number;
  dineInPercentage: number;
  deliveryCount: number;
  deliveryPercentage: number;
  topType: string;
  topTypeCount: number;
}

export interface RecentSaleItemDTO {
  orderNo: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface LowStockAlertItemDTO {
  id: number;
  name: string;
  currentStock: number;
  unitAbbr: string;
  status: 'LOW' | 'OUT_OF_STOCK' | 'NORMAL';
}
