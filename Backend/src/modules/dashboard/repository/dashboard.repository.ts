import { pool } from '../../../config/db.js';
import {
  DashboardMetricsDTO,
  SalesTrendDataPoint,
  OrdersByTypeDTO,
  RecentSaleItemDTO,
  LowStockAlertItemDTO,
} from '../dto/dashboard.dto.js';

export class DashboardRepository {
  async getMetrics(branchId?: number): Promise<DashboardMetricsDTO> {
    const branchFilter = branchId ? 'AND branch_id = $1' : '';
    const params = branchId ? [branchId] : [];

    // Total sales & order count
    const salesRes = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_sales, COUNT(*) AS total_orders
       FROM pos_orders
       WHERE status = 'COMPLETED' ${branchFilter}`,
      params
    );

    // Active customers count
    const custRes = await pool.query(
      `SELECT COUNT(*) AS active_customers FROM customers`
    );

    // Monthly Growth (compare current month revenue to previous month revenue)
    const growthRes = await pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE) THEN total_amount ELSE 0 END), 0) AS current_month,
         COALESCE(SUM(CASE WHEN created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
                           AND created_at < date_trunc('month', CURRENT_DATE) THEN total_amount ELSE 0 END), 0) AS prev_month
       FROM pos_orders
       WHERE status = 'COMPLETED' ${branchFilter}`,
      params
    );

    const currentMonthRevenue = parseFloat(growthRes.rows[0].current_month || '0');
    const prevMonthRevenue = parseFloat(growthRes.rows[0].prev_month || '0');
    
    let monthlyGrowth = 0;
    if (prevMonthRevenue > 0) {
      monthlyGrowth = parseFloat((((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1));
    } else if (currentMonthRevenue > 0) {
      monthlyGrowth = 100.0;
    }

    return {
      totalSales: parseFloat(salesRes.rows[0].total_sales || '0'),
      totalOrders: parseInt(salesRes.rows[0].total_orders || '0', 10),
      activeCustomers: parseInt(custRes.rows[0].active_customers || '0', 10),
      monthlyGrowth,
    };
  }

  async getSalesTrend(period: string, branchId?: number): Promise<SalesTrendDataPoint[]> {
    let daysCount = 7;
    if (period === 'This Month') daysCount = 30;
    if (period === 'This Year') daysCount = 365;

    const branchFilter = branchId ? 'AND branch_id = $2' : '';
    const params: any[] = [daysCount];
    if (branchId) params.push(branchId);

    const result = await pool.query(
      `SELECT 
         to_char(d.day, 'Mon DD') AS day,
         COALESCE(SUM(p.total_amount), 0) AS sales
       FROM generate_series(
         CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day',
         CURRENT_DATE,
         INTERVAL '1 day'
       ) AS d(day)
       LEFT JOIN pos_orders p ON date_trunc('day', p.created_at) = d.day 
         AND p.status = 'COMPLETED' ${branchFilter}
       GROUP BY d.day
       ORDER BY d.day ASC`,
      params
    );

    return result.rows.map((row, idx) => ({
      day: row.day || `Day ${idx + 1}`,
      sales: parseFloat(row.sales || '0'),
    }));
  }

  async getOrdersByType(period: string, branchId?: number): Promise<OrdersByTypeDTO> {
    let dateCondition = "WHERE created_at >= date_trunc('month', CURRENT_DATE)";
    if (period === 'Today') {
      dateCondition = "WHERE created_at >= date_trunc('day', CURRENT_DATE)";
    } else if (period === 'This Week') {
      dateCondition = "WHERE created_at >= date_trunc('week', CURRENT_DATE)";
    }

    const params: any[] = [];
    let branchFilter = '';
    if (branchId) {
      params.push(branchId);
      branchFilter = `AND branch_id = $${params.length}`;
    }

    const query = `
      SELECT 
        order_type,
        COUNT(*) AS count
      FROM pos_orders
      ${dateCondition} ${branchFilter}
      GROUP BY order_type
    `;

    const res = await pool.query(query, params);

    let takeawayCount = 0;
    let dineInCount = 0;
    let deliveryCount = 0;

    res.rows.forEach(row => {
      const type = (row.order_type || '').toUpperCase();
      const cnt = parseInt(row.count, 10);
      if (type === 'TAKE_AWAY' || type === 'TAKEAWAY') takeawayCount += cnt;
      else if (type === 'DINE_IN' || type === 'DINEIN') dineInCount += cnt;
      else if (type === 'DELIVERY') deliveryCount += cnt;
      else takeawayCount += cnt;
    });

    const total = takeawayCount + dineInCount + deliveryCount || 1;
    const takeawayPercentage = Math.round((takeawayCount / total) * 100);
    const dineInPercentage = Math.round((dineInCount / total) * 100);
    const deliveryPercentage = Math.round((deliveryCount / total) * 100);

    let topType = 'Take Away';
    let topTypeCount = takeawayCount;
    if (dineInCount > takeawayCount && dineInCount >= deliveryCount) {
      topType = 'Dine-In';
      topTypeCount = dineInCount;
    } else if (deliveryCount > takeawayCount && deliveryCount > dineInCount) {
      topType = 'Delivery';
      topTypeCount = deliveryCount;
    }

    return {
      takeawayCount,
      takeawayPercentage,
      dineInCount,
      dineInPercentage,
      deliveryCount,
      deliveryPercentage,
      topType,
      topTypeCount,
    };
  }

  async getRecentSales(limit: number = 5, branchId?: number): Promise<RecentSaleItemDTO[]> {
    const params: any[] = [limit];
    let branchFilter = '';
    if (branchId) {
      params.push(branchId);
      branchFilter = `AND p.branch_id = $${params.length}`;
    }

    const query = `
      SELECT 
        p.order_no,
        COALESCE(c.name, 'Walk-in Customer') AS customer_name,
        p.total_amount,
        p.status,
        p.created_at
      FROM pos_orders p
      LEFT JOIN customers c ON p.customer_id = c.id
      WHERE 1=1 ${branchFilter}
      ORDER BY p.created_at DESC
      LIMIT $1
    `;

    const res = await pool.query(query, params);

    return res.rows.map(row => ({
      orderNo: row.order_no,
      customerName: row.customer_name,
      totalAmount: parseFloat(row.total_amount || '0'),
      status: row.status || 'COMPLETED',
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    }));
  }

  async getLowStockAlerts(branchId?: number): Promise<LowStockAlertItemDTO[]> {
    const params: any[] = [];
    let branchFilter = '';
    if (branchId) {
      params.push(branchId);
      branchFilter = `AND s.branch_id = $${params.length}`;
    }

    const query = `
      SELECT 
        p.id,
        p.name,
        s.current_stock,
        s.reorder_level,
        COALESCE(u.abbreviation, 'pcs') AS unit_abbr
      FROM inventory_stock s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN units u ON p.unit_id = u.id
      WHERE s.current_stock <= s.reorder_level ${branchFilter}
      ORDER BY s.current_stock ASC
      LIMIT 10
    `;

    const res = await pool.query(query, params);

    return res.rows.map(row => {
      const currentStock = parseFloat(row.current_stock || '0');
      let status: 'LOW' | 'OUT_OF_STOCK' | 'NORMAL' = 'LOW';
      if (currentStock <= 0) {
        status = 'OUT_OF_STOCK';
      }
      return {
        id: row.id,
        name: row.name,
        currentStock,
        unitAbbr: row.unit_abbr,
        status,
      };
    });
  }
}
