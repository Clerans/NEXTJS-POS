import { ReportRepository } from '../repository/reports.repository.js';
import {
  ReportFilterDto,
  SalesSummaryReportDto,
  ProductMarginReportDto,
  PaymentSummaryReportDto,
  DailySalesReportDto,
  InventoryLedgerReportDto,
  SupplierSummaryReportDto,
} from '../dto/reports.dto.js';
import { BadRequestError } from '../../../common/errors/app-error.js';

export class ReportService {
  private reportRepository: ReportRepository;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  async getSalesSummary(filters: ReportFilterDto): Promise<SalesSummaryReportDto> {
    if (filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate)) {
      throw new BadRequestError('Start date cannot be after End date');
    }

    return await this.reportRepository.getSalesSummary(filters);
  }

  async getProductMargins(filters?: ReportFilterDto): Promise<ProductMarginReportDto[]> {
    return await this.reportRepository.getProductMargins(filters);
  }

  async getPaymentSummary(filters?: ReportFilterDto): Promise<PaymentSummaryReportDto[]> {
    return await this.reportRepository.getPaymentSummary(filters);
  }

  async getDailySales(filters?: ReportFilterDto): Promise<DailySalesReportDto[]> {
    return await this.reportRepository.getDailySales(filters);
  }

  async getInventoryLedgerReport(): Promise<InventoryLedgerReportDto[]> {
    return await this.reportRepository.getInventoryLedgerReport();
  }

  async getSupplierSummary(): Promise<SupplierSummaryReportDto[]> {
    return await this.reportRepository.getSupplierSummary();
  }
}
