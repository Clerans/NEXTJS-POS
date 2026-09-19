import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../service/reports.service.js';
import { reportFilterSchema } from '../validator/reports.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';
import { AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  private resolveBranchFilter(req: Request, filters: any) {
    const user = (req as AuthenticatedRequest).user;
    if (user && user.role !== 'ADMINISTRATOR') {
      filters.branchId = filters.branchId || user.branchId || (user.branchIds && user.branchIds[0]) || 1;
    }
    return filters;
  }

  getSalesSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedFilters = this.resolveBranchFilter(req, reportFilterSchema.parse(req.query));
      const summary = await this.reportService.getSalesSummary(validatedFilters);
      res.status(200).json(ApiResponse.success(summary, 'Sales summary report generated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getProductMargins = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedFilters = this.resolveBranchFilter(req, reportFilterSchema.partial().parse(req.query));
      const margins = await this.reportService.getProductMargins(validatedFilters);
      res.status(200).json(ApiResponse.success(margins, 'Product gross margins report generated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getPaymentSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedFilters = this.resolveBranchFilter(req, reportFilterSchema.partial().parse(req.query));
      const summary = await this.reportService.getPaymentSummary(validatedFilters);
      res.status(200).json(ApiResponse.success(summary, 'Payment method breakdown report generated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getDailySales = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedFilters = this.resolveBranchFilter(req, reportFilterSchema.partial().parse(req.query));
      const summary = await this.reportService.getDailySales(validatedFilters);
      res.status(200).json(ApiResponse.success(summary, 'Daily sales breakdown report generated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getInventoryLedgerReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await this.reportService.getInventoryLedgerReport();
      res.status(200).json(ApiResponse.success(report, 'Inventory ledger report generated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getSupplierSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await this.reportService.getSupplierSummary();
      res.status(200).json(ApiResponse.success(report, 'Supplier purchasing summary report generated successfully'));
    } catch (error) {
      next(error);
    }
  };
}
