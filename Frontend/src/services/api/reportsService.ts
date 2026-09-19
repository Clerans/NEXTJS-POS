import { api } from './axiosInstance';

export interface SalesSummaryReport {
  totalRevenue: number;
  totalOrders: number;
  totalDiscount: number;
  totalTax: number;
  netProfit: number;
  cogsAmount: number;
  grossMarginPercentage: number;
  startDate: string;
  endDate: string;
}

export interface ProductMarginReport {
  productId: number;
  productName: string;
  sku: string;
  totalQuantitySold: number;
  totalSalesValue: number;
  cogsCost: number;
  profitMargin: number;
  marginPercentage: number;
}

export interface PaymentSummaryReport {
  paymentMethod: string;
  orderCount: number;
  totalAmount: number;
  percentage: number;
}

export interface DailySalesReport {
  date: string;
  orderCount: number;
  totalRevenue: number;
  netProfit: number;
}

export interface InventoryLedgerReport {
  productId?: number;
  rawMaterialId?: number;
  name: string;
  transactionType: string;
  totalQuantityChange: number;
  balanceAfter: number;
}

export interface SupplierSummaryReport {
  supplierId: number;
  supplierName: string;
  totalPOs: number;
  totalSpent: number;
}

export const reportsService = {
  async getSalesSummary(startDate?: string, endDate?: string, branchId?: number): Promise<SalesSummaryReport> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (branchId) params.append('branchId', String(branchId));
    const response = await api.get(`/reports/sales-summary?${params.toString()}`);
    return response.data.data || response.data;
  },

  async getProductMargins(startDate?: string, endDate?: string, branchId?: number): Promise<ProductMarginReport[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (branchId) params.append('branchId', String(branchId));
    const response = await api.get(`/reports/cogs-margin?${params.toString()}`);
    return response.data.data || response.data;
  },

  async getPaymentSummary(startDate?: string, endDate?: string, branchId?: number): Promise<PaymentSummaryReport[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (branchId) params.append('branchId', String(branchId));
    const response = await api.get(`/reports/payment-summary?${params.toString()}`);
    return response.data.data || response.data;
  },

  async getDailySales(startDate?: string, endDate?: string, branchId?: number): Promise<DailySalesReport[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (branchId) params.append('branchId', String(branchId));
    const response = await api.get(`/reports/daily-sales?${params.toString()}`);
    return response.data.data || response.data;
  },

  async getInventoryLedger(): Promise<InventoryLedgerReport[]> {
    const response = await api.get('/reports/inventory-ledger');
    return response.data.data || response.data;
  },

  async getSupplierSummary(): Promise<SupplierSummaryReport[]> {
    const response = await api.get('/reports/supplier-summary');
    return response.data.data || response.data;
  },
};
