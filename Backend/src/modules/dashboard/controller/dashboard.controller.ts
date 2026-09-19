import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../service/dashboard.service.js';
import {
  salesTrendFilterSchema,
  ordersByTypeFilterSchema,
  recentSalesFilterSchema,
  lowStockFilterSchema,
} from '../validator/dashboard.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class DashboardController {
  private service: DashboardService;

  constructor() {
    this.service = new DashboardService();
  }

  getMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;
      const metrics = await this.service.getMetrics(branchId);
      res.status(200).json(ApiResponse.success(metrics, 'Dashboard metrics retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getSalesTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = salesTrendFilterSchema.parse(req.query);
      const trend = await this.service.getSalesTrend(filters.period, filters.branchId);
      res.status(200).json(ApiResponse.success(trend, 'Sales trend retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getOrdersByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = ordersByTypeFilterSchema.parse(req.query);
      const ordersByType = await this.service.getOrdersByType(filters.period, filters.branchId);
      res.status(200).json(ApiResponse.success(ordersByType, 'Orders by type retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getRecentSales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = recentSalesFilterSchema.parse(req.query);
      const recentSales = await this.service.getRecentSales(filters.limit, filters.branchId);
      res.status(200).json(ApiResponse.success(recentSales, 'Recent sales retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getLowStockAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = lowStockFilterSchema.parse(req.query);
      const alerts = await this.service.getLowStockAlerts(filters.branchId);
      res.status(200).json(ApiResponse.success(alerts, 'Low stock alerts retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
