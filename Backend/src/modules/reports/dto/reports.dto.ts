export interface ReportFilterDto {
  startDate?: string;
  endDate?: string;
  branchId?: number;
  paymentMethod?: string;
  categoryId?: number;
  productId?: number;
  customerId?: number;
  format?: 'json' | 'csv' | 'pdf';
}

export interface SalesSummaryReportDto {
  totalRevenue: number;
  totalSubtotal: number;
  totalOrders: number;
  totalDiscount: number;
  totalTax: number;
  netProfit: number;
  cogsAmount: number;
  grossMarginPercentage: number;
  startDate: string;
  endDate: string;
}

export interface ProductMarginReportDto {
  productId: number;
  productName: string;
  sku: string;
  totalQuantitySold: number;
  totalSalesValue: number;
  cogsCost: number;
  profitMargin: number;
  marginPercentage: number;
}

export interface PaymentSummaryReportDto {
  paymentMethod: string;
  orderCount: number;
  totalAmount: number;
  percentage: number;
}

export interface DailySalesReportDto {
  date: string;
  orderCount: number;
  totalRevenue: number;
  netProfit: number;
}

export interface InventoryLedgerReportDto {
  productId?: number;
  rawMaterialId?: number;
  name: string;
  transactionType: string;
  totalQuantityChange: number;
  balanceAfter: number;
}

export interface SupplierSummaryReportDto {
  supplierId: number;
  supplierName: string;
  totalPOs: number;
  totalSpent: number;
}
