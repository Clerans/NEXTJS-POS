import React, { useState, useEffect } from 'react';
import {
  CircleDollarSign,
  Users,
  TrendingUp,
  Package,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  dashboardService,
  DashboardMetrics,
  SalesTrendItem,
  OrdersByType,
  RecentSaleItem,
  LowStockAlertItem,
} from '@/services/api/dashboardService';

export const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalSales: 0,
    activeCustomers: 0,
    monthlyGrowth: 0,
    totalOrders: 0,
  });

  const [trendPeriod, setTrendPeriod] = useState<string>('This Week');
  const [chartData, setChartData] = useState<SalesTrendItem[]>([]);

  const [orderTypePeriod, setOrderTypePeriod] = useState<string>('This Month');
  const [ordersByType, setOrdersByType] = useState<OrdersByType>({
    takeawayCount: 0,
    takeawayPercentage: 0,
    dineInCount: 0,
    dineInPercentage: 0,
    deliveryCount: 0,
    deliveryPercentage: 0,
    topType: 'Take Away',
    topTypeCount: 0,
  });

  const [recentSales, setRecentSales] = useState<RecentSaleItem[]>([]);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlertItem[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const kpis = await dashboardService.getMetrics();
        if (kpis) setMetrics(kpis);

        const recent = await dashboardService.getRecentSales(5);
        if (recent) setRecentSales(recent);

        const stockAlerts = await dashboardService.getLowStockAlerts();
        if (stockAlerts) setLowStockAlerts(stockAlerts);
      } catch (err) {
        console.warn('Error loading metrics', err);
      }
    };
    loadDashboardData();
  }, []);

  useEffect(() => {
    const loadTrend = async () => {
      try {
        const trend = await dashboardService.getSalesTrend(trendPeriod);
        if (trend) setChartData(trend);
      } catch (err) {
        console.warn('Error loading trend', err);
      }
    };
    loadTrend();
  }, [trendPeriod]);

  useEffect(() => {
    const loadOrdersByType = async () => {
      try {
        const obt = await dashboardService.getOrdersByType(orderTypePeriod);
        if (obt) setOrdersByType(obt);
      } catch (err) {
        console.warn('Error loading orders by type', err);
      }
    };
    loadOrdersByType();
  }, [orderTypePeriod]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-textDark tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-xs text-textGray font-medium mt-0.5">
          Real-time enterprise metrics and store operational performance
        </p>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-white p-4.5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="stat-label flex items-center justify-between text-xs font-semibold text-textGray mb-2">
            Total Sales
            <CircleDollarSign className="w-4 h-4 text-textDark" />
          </div>
          <div className="stat-value text-xl font-black text-textDark">
            Rs. {metrics.totalSales.toLocaleString('en-US')}
          </div>
        </div>

        <div className="card bg-white p-4.5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="stat-label flex items-center justify-between text-xs font-semibold text-textGray mb-2">
            Active Customers
            <Users className="w-4 h-4 text-textGray" />
          </div>
          <div className="stat-value text-xl font-black text-textDark">
            {metrics.activeCustomers.toLocaleString('en-US')}
          </div>
        </div>

        <div className="card bg-white p-4.5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="stat-label flex items-center justify-between text-xs font-semibold text-textGray mb-2">
            Monthly Growth
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="stat-value text-xl font-black text-emerald-600">
            {metrics.monthlyGrowth >= 0 ? `+${metrics.monthlyGrowth}%` : `${metrics.monthlyGrowth}%`}
          </div>
        </div>

        <div className="card bg-white p-4.5 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
          <div className="stat-label flex items-center justify-between text-xs font-semibold text-textGray mb-2">
            Monthly Orders
            <Package className="w-4 h-4 text-textGray" />
          </div>
          <div className="stat-value text-xl font-black text-textDark">
            {metrics.totalOrders.toLocaleString('en-US')}
          </div>
        </div>
      </div>

      {/* Middle Panels: Sales Trend & Orders by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Trend Chart (Col 7) */}
        <div className="lg:col-span-7 card bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-textDark">Sales Trend</h2>
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value)}
              className="select border border-border rounded-lg px-2.5 py-1 text-xs font-semibold bg-white"
            >
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          <div className="h-44 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <XAxis dataKey="day" hide />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number) => [`Rs. ${Number(value || 0).toLocaleString('en-US')}`, 'Sales']}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#004953"
                    strokeWidth={3}
                    dot={{ fill: '#004953', stroke: '#004953', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-textGray">
                No trend data available for period
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-textGray mt-3 pt-2 border-t border-border/50">
            <span>Period: {trendPeriod}</span>
            <span className="font-bold text-textDark">Total: Rs. {metrics.totalSales.toLocaleString('en-US')}</span>
          </div>
        </div>

        {/* Orders by Type (Col 5) */}
        <div className="lg:col-span-5 card bg-white p-5 rounded-xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm text-textDark">Orders by Type</h2>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1.5 mb-4">
            {['Today', 'This Week', 'This Month'].map((p) => (
              <button
                key={p}
                onClick={() => setOrderTypePeriod(p)}
                className={
                  orderTypePeriod === p
                    ? 'px-3.5 py-1 text-xs font-semibold rounded-full text-white shadow-sm'
                    : 'px-3 py-1 text-xs font-semibold rounded-md text-textGray hover:bg-slate-100 transition-colors'
                }
                style={orderTypePeriod === p ? { backgroundColor: '#004953' } : undefined}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Breakdown Header % */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs border-b border-border/50 pb-3 mb-3">
            <div>
              <div className="text-[11px] text-textGray font-medium">Take Away</div>
              <div className="font-bold text-textDark text-sm">{ordersByType.takeawayPercentage}%</div>
            </div>
            <div>
              <div className="text-[11px] text-textGray font-medium">Dine-In</div>
              <div className="font-bold text-textDark text-sm">{ordersByType.dineInPercentage}%</div>
            </div>
            <div>
              <div className="text-[11px] text-textGray font-medium">Delivery</div>
              <div className="font-bold text-textDark text-sm">{ordersByType.deliveryPercentage}%</div>
            </div>
          </div>

          {/* Highlighted Order Type Card */}
          <div className="bg-[#E8F3F5] rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-textDark">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004953] inline-block" />
              {ordersByType.topType}
            </div>
            <div className="text-xs font-bold text-textDark">{ordersByType.topTypeCount} orders</div>
          </div>
        </div>
      </div>

      {/* Bottom Panels: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Sales */}
        <div className="card bg-white p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-textDark">Recent Sales</h2>
            <button className="text-xs font-semibold text-textGray hover:text-textDark hover:underline">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] text-textGray uppercase tracking-wider font-extrabold border-b border-border">
                  <th className="py-2.5 px-3">ORDER NO</th>
                  <th className="py-2.5 px-3">CUSTOMER</th>
                  <th className="py-2.5 px-3">TOTAL</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentSales.length > 0 ? (
                  recentSales.map((sale, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-semibold text-textDark">{sale.orderNo}</td>
                      <td className="py-3 px-3 text-textDark">{sale.customerName}</td>
                      <td className="py-3 px-3 font-medium text-textDark">Rs. {sale.totalAmount.toLocaleString('en-US')}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-textGray">
                      No recent sales
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card bg-white p-5 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 font-bold text-sm text-textDark">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Alerts
            </div>
            <select className="select border border-border rounded-lg px-2.5 py-1 text-xs font-semibold bg-white">
              <option>All Branches</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] text-textGray uppercase tracking-wider font-extrabold border-b border-border">
                  <th className="py-2.5 px-3">ITEM</th>
                  <th className="py-2.5 px-3">STOCK</th>
                  <th className="py-2.5 px-3 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {lowStockAlerts.length > 0 ? (
                  lowStockAlerts.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-medium text-textDark">{item.name}</td>
                      <td className="py-3 px-3 font-semibold text-textDark">
                        {item.currentStock} {item.unitAbbr}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.status === 'OUT_OF_STOCK' ? (
                          <span className="inline-block bg-rose-100 text-rose-700 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                            Out of Stock
                          </span>
                        ) : (
                          <span className="inline-block bg-cyan-50 text-cyan-700 font-semibold px-3 py-0.5 rounded-full text-[11px]">
                            Low
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center py-6 text-textGray">
                      No stock alerts
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
