import { pool } from '../../../config/db.js';
import {
  ReportFilterDto,
  SalesSummaryReportDto,
  ProductMarginReportDto,
  PaymentSummaryReportDto,
  DailySalesReportDto,
  InventoryLedgerReportDto,
  SupplierSummaryReportDto,
} from '../dto/reports.dto.js';

export class ReportRepository {
  private buildDateAndBranchClause(
    filters?: ReportFilterDto,
    tableAlias: string = ''
  ): { clause: string; params: any[] } {
    const prefix = tableAlias ? `${tableAlias}.` : '';
    const params: any[] = [];
    const conditions: string[] = [];

    const startDate = filters?.startDate || '2026-01-01';
    const endDate = filters?.endDate || '2026-12-31';

    params.push(startDate);
    conditions.push(`${prefix}created_at >= $${params.length}::timestamp`);

    params.push(endDate);
    conditions.push(`${prefix}created_at <= ($${params.length}::timestamp + INTERVAL '1 day')`);

    if (filters?.branchId) {
      params.push(filters.branchId);
      conditions.push(`${prefix}branch_id = $${params.length}`);
    }

    return {
      clause: conditions.length > 0 ? ` AND ${conditions.join(' AND ')}` : '',
      params,
    };
  }

  async getSalesSummary(filters: ReportFilterDto): Promise<SalesSummaryReportDto> {
    const startDate = filters.startDate || '2026-01-01';
    const endDate = filters.endDate || '2026-12-31';
    const { clause, params } = this.buildDateAndBranchClause(filters);

    const salesRes = await pool.query(
      `SELECT 
         COALESCE(SUM(total_amount), 0) as total_revenue,
         COUNT(id) as total_orders,
         COALESCE(SUM(discount_amount), 0) as total_discount,
         COALESCE(SUM(tax_amount), 0) as total_tax,
         COALESCE(SUM(subtotal), 0) as total_subtotal
       FROM pos_orders
       WHERE status = 'COMPLETED'${clause}`,
      params
    );

    const { clause: poClause, params: poParams } = this.buildDateAndBranchClause(filters, 'po');
    const cogsRes = await pool.query(
      `SELECT 
         COALESCE(SUM(poi.quantity * COALESCE(p.cost_price, 0)), 0) as total_cogs
       FROM pos_order_items poi
       JOIN pos_orders po ON poi.order_id = po.id
       JOIN products p ON poi.product_id = p.id
       WHERE po.status = 'COMPLETED'${poClause}`,
      poParams
    );

    const row = salesRes.rows[0];
    const totalRevenue = parseFloat(row.total_revenue || 0);
    const totalOrders = parseInt(row.total_orders || 0, 10);
    const totalDiscount = parseFloat(row.total_discount || 0);
    const totalTax = parseFloat(row.total_tax || 0);
    const totalSubtotal = parseFloat(row.total_subtotal || 0);

    // True COGS from sold line items and catalog cost price
    const cogsAmount = parseFloat(cogsRes.rows[0].total_cogs || 0);

    // Gross Profit = (Subtotal - Discount) - COGS
    const netProfit = (totalSubtotal - totalDiscount) - cogsAmount;
    const grossMarginPercentage = totalRevenue > 0 ? parseFloat(((netProfit / totalRevenue) * 100).toFixed(2)) : 0;

    return {
      totalRevenue,
      totalSubtotal,
      totalOrders,
      totalDiscount,
      totalTax,
      netProfit,
      cogsAmount,
      grossMarginPercentage,
      startDate,
      endDate,
    };
  }

  async getProductMargins(filters?: ReportFilterDto): Promise<ProductMarginReportDto[]> {
    const { clause, params } = this.buildDateAndBranchClause(filters, 'po');

    const result = await pool.query(
      `SELECT p.id as product_id, p.name as product_name, p.sku, p.cost_price,
              COALESCE(SUM(poi.quantity), 0) as total_qty,
              COALESCE(SUM(poi.subtotal), 0) as total_sales
       FROM products p
       LEFT JOIN pos_order_items poi ON poi.product_id = p.id
       LEFT JOIN pos_orders po ON poi.order_id = po.id AND po.status = 'COMPLETED'${clause}
       GROUP BY p.id, p.name, p.sku, p.cost_price
       ORDER BY total_sales DESC`,
      params
    );

    return result.rows.map((row: any) => {
      const qty = parseFloat(row.total_qty || 0);
      const totalSales = parseFloat(row.total_sales || 0);
      const costPrice = parseFloat(row.cost_price || 0);
      const cogsCost = qty * costPrice;
      const profitMargin = totalSales - cogsCost;
      const marginPercentage = totalSales > 0 ? parseFloat(((profitMargin / totalSales) * 100).toFixed(2)) : 0;

      return {
        productId: parseInt(row.product_id, 10),
        productName: row.product_name,
        sku: row.sku,
        totalQuantitySold: qty,
        totalSalesValue: totalSales,
        cogsCost,
        profitMargin,
        marginPercentage,
      };
    });
  }

  async getPaymentSummary(filters?: ReportFilterDto): Promise<PaymentSummaryReportDto[]> {
    const { clause, params } = this.buildDateAndBranchClause(filters);

    const result = await pool.query(
      `SELECT payment_method, COUNT(id) as order_count, COALESCE(SUM(total_amount), 0) as total_amount
       FROM pos_orders
       WHERE status = 'COMPLETED'${clause}
       GROUP BY payment_method`,
      params
    );

    const totalGrand = result.rows.reduce((acc, r) => acc + parseFloat(r.total_amount || 0), 0) || 1;

    return result.rows.map((row) => {
      const amt = parseFloat(row.total_amount || 0);
      return {
        paymentMethod: row.payment_method || 'CASH',
        orderCount: parseInt(row.order_count || 0, 10),
        totalAmount: amt,
        percentage: parseFloat(((amt / totalGrand) * 100).toFixed(2)),
      };
    });
  }

  async getDailySales(filters?: ReportFilterDto): Promise<DailySalesReportDto[]> {
    const { clause, params } = this.buildDateAndBranchClause(filters, 'po');

    const result = await pool.query(
      `SELECT 
         to_char(po.created_at, 'YYYY-MM-DD') as sales_date,
         COUNT(DISTINCT po.id) as order_count,
         COALESCE(SUM(po.total_amount), 0) as total_revenue,
         COALESCE(SUM(poi.quantity * COALESCE(p.cost_price, 0)), 0) as total_cogs
       FROM pos_orders po
       LEFT JOIN pos_order_items poi ON poi.order_id = po.id
       LEFT JOIN products p ON poi.product_id = p.id
       WHERE po.status = 'COMPLETED'${clause}
       GROUP BY sales_date
       ORDER BY sales_date DESC
       LIMIT 30`,
      params
    );

    return result.rows.map((row) => {
      const rev = parseFloat(row.total_revenue || 0);
      const cogs = parseFloat(row.total_cogs || 0);
      return {
        date: row.sales_date,
        orderCount: parseInt(row.order_count || 0, 10),
        totalRevenue: rev,
        netProfit: rev - cogs,
      };
    });
  }

  async getInventoryLedgerReport(): Promise<InventoryLedgerReportDto[]> {
    const result = await pool.query(
      `SELECT 
         l.product_id,
         l.raw_material_id,
         COALESCE(p.name, rm.name, 'Item') as item_name,
         l.transaction_type,
         SUM(l.quantity_change) as total_change,
         MAX(l.balance_after) as latest_balance
       FROM inventory_ledger l
       LEFT JOIN products p ON l.product_id = p.id
       LEFT JOIN raw_materials rm ON l.raw_material_id = rm.id
       GROUP BY l.product_id, l.raw_material_id, p.name, rm.name, l.transaction_type
       ORDER BY item_name ASC`
    );

    return result.rows.map((row) => ({
      productId: row.product_id ? parseInt(row.product_id, 10) : undefined,
      rawMaterialId: row.raw_material_id ? parseInt(row.raw_material_id, 10) : undefined,
      name: row.item_name,
      transactionType: row.transaction_type,
      totalQuantityChange: parseFloat(row.total_change || 0),
      balanceAfter: parseFloat(row.latest_balance || 0),
    }));
  }

  async getSupplierSummary(): Promise<SupplierSummaryReportDto[]> {
    const result = await pool.query(
      `SELECT s.id as supplier_id, s.name as supplier_name,
              COUNT(po.id) as total_pos,
              COALESCE(SUM(po.total_amount), 0) as total_spent
       FROM suppliers s
       LEFT JOIN purchase_orders po ON po.supplier_id = s.id
       GROUP BY s.id, s.name
       ORDER BY total_spent DESC`
    );

    return result.rows.map((row) => ({
      supplierId: parseInt(row.supplier_id, 10),
      supplierName: row.supplier_name,
      totalPOs: parseInt(row.total_pos || 0, 10),
      totalSpent: parseFloat(row.total_spent || 0),
    }));
  }
}
