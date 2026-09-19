import { api } from './axiosInstance';

export interface DashboardMetrics {
  totalSales: number;
  activeCustomers: number;
  monthlyGrowth: number;
  totalOrders: number;
}

export interface SalesTrendItem {
  day: string;
  sales: number;
}

export interface OrdersByType {
  takeawayCount: number;
  takeawayPercentage: number;
  dineInCount: number;
  dineInPercentage: number;
  deliveryCount: number;
  deliveryPercentage: number;
  topType: string;
  topTypeCount: number;
}

export interface RecentSaleItem {
  orderNo: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface LowStockAlertItem {
  id: number;
  name: string;
  currentStock: number;
  unitAbbr: string;
  status: 'LOW' | 'OUT_OF_STOCK' | 'NORMAL';
}

export const dashboardService = {
  async getMetrics(branchId?: number): Promise<DashboardMetrics> {
    const params = branchId ? `?branchId=${branchId}` : '';
    const res = await api.get(`/dashboard/metrics${params}`);
    return res.data.data || res.data;
  },

  async getSalesTrend(period: string = 'This Week', branchId?: number): Promise<SalesTrendItem[]> {
    const params = new URLSearchParams({ period });
    if (branchId) params.append('branchId', String(branchId));
    const res = await api.get(`/dashboard/sales-trend?${params.toString()}`);
    return res.data.data || res.data;
  },

  async getOrdersByType(period: string = 'This Month', branchId?: number): Promise<OrdersByType> {
    const params = new URLSearchParams({ period });
    if (branchId) params.append('branchId', String(branchId));
    const res = await api.get(`/dashboard/orders-by-type?${params.toString()}`);
    return res.data.data || res.data;
  },

  async getRecentSales(limit: number = 5, branchId?: number): Promise<RecentSaleItem[]> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (branchId) params.append('branchId', String(branchId));
    const res = await api.get(`/dashboard/recent-sales?${params.toString()}`);
    return res.data.data || res.data;
  },

  async getLowStockAlerts(branchId?: number): Promise<LowStockAlertItem[]> {
    const params = branchId ? `?branchId=${branchId}` : '';
    const res = await api.get(`/dashboard/low-stock-alerts${params}`);
    return res.data.data || res.data;
  },
};
