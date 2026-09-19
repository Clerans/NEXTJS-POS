import { DashboardRepository } from '../repository/dashboard.repository.js';
import {
  DashboardMetricsDTO,
  SalesTrendDataPoint,
  OrdersByTypeDTO,
  RecentSaleItemDTO,
  LowStockAlertItemDTO,
} from '../dto/dashboard.dto.js';

export class DashboardService {
  private repository: DashboardRepository;

  constructor() {
    this.repository = new DashboardRepository();
  }

  async getMetrics(branchId?: number): Promise<DashboardMetricsDTO> {
    return await this.repository.getMetrics(branchId);
  }

  async getSalesTrend(period: string, branchId?: number): Promise<SalesTrendDataPoint[]> {
    return await this.repository.getSalesTrend(period, branchId);
  }

  async getOrdersByType(period: string, branchId?: number): Promise<OrdersByTypeDTO> {
    return await this.repository.getOrdersByType(period, branchId);
  }

  async getRecentSales(limit?: number, branchId?: number): Promise<RecentSaleItemDTO[]> {
    return await this.repository.getRecentSales(limit, branchId);
  }

  async getLowStockAlerts(branchId?: number): Promise<LowStockAlertItemDTO[]> {
    return await this.repository.getLowStockAlerts(branchId);
  }
}
