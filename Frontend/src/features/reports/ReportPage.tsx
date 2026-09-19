import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, Printer, TrendingUp, DollarSign, ShoppingBag, PieChart as PieIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  reportsService,
  SalesSummaryReport,
  PaymentSummaryReport,
  DailySalesReport,
  ProductMarginReport,
} from '@/services/api/reportsService';
import { branchesService, Branch } from '@/services/api/branchesService';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ReportColumn {
  header: string;
  accessorKey: string;
  isBold?: boolean;
}

interface ReportPageProps {
  title: string;
  subtitle: string;
  columns?: ReportColumn[];
  data?: Record<string, any>[];
  summaryText?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const ReportPage: React.FC<ReportPageProps> = ({
  title,
  subtitle,
  columns: initialColumns,
  data: initialData,
  summaryText: initialSummary,
}) => {
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');
  const [branchId, setBranchId] = useState<number | 'ALL'>('ALL');
  const [branches, setBranches] = useState<Branch[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [salesSummary, setSalesSummary] = useState<SalesSummaryReport | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummaryReport[]>([]);
  const [dailySales, setDailySales] = useState<DailySalesReport[]>([]);
  const [productMargins, setProductMargins] = useState<ProductMarginReport[]>([]);

  useEffect(() => {
    branchesService.getAll().then(setBranches).catch(() => {});
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    const bId = branchId === 'ALL' ? undefined : (branchId as number);

    try {
      const [summary, payments, daily, margins] = await Promise.all([
        reportsService.getSalesSummary(startDate, endDate, bId).catch(() => null),
        reportsService.getPaymentSummary(startDate, endDate, bId).catch(() => []),
        reportsService.getDailySales(startDate, endDate, bId).catch(() => []),
        reportsService.getProductMargins(startDate, endDate, bId).catch(() => []),
      ]);

      if (summary) setSalesSummary(summary);
      if (payments) setPaymentSummary(payments);
      if (daily) setDailySales(daily);
      if (margins) setProductMargins(margins);
    } catch (err: any) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [startDate, endDate, branchId, title]);

  const handleExportCSV = () => {
    let content = 'Report Title: ' + title + '\n';
    content += `Date Range: ${startDate} to ${endDate}\n\n`;

    if (dailySales.length > 0) {
      content += 'Date,Orders,Revenue (Rs.),Net Profit (Rs.)\n';
      dailySales.forEach((d) => {
        content += `${d.date},${d.orderCount},${d.totalRevenue},${d.netProfit}\n`;
      });
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Report exported successfully');
  };

  // Reconciled Total Metrics
  const totalSalesRevenue = salesSummary?.totalRevenue || dailySales.reduce((sum, d) => sum + d.totalRevenue, 0);
  const totalPaymentSum = paymentSummary.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalOrdersCount = salesSummary?.totalOrders || dailySales.reduce((sum, d) => sum + d.orderCount, 0);

  return (
    <div className="space-y-6">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">{title}</h1>
          <div className="page-sub">{subtitle}</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-1.5 text-xs">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button variant="orange" onClick={() => window.print()} className="btn-orange flex items-center gap-1.5">
            <Printer className="w-4 h-4" /> Print Report
          </Button>
        </div>
      </div>

      {/* Date Range & Branch Filters */}
      <div className="card">
        <div className="filters-grid three items-end">
          <div className="field mb-0">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              className="input w-full text-xs"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="field mb-0">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              className="input w-full text-xs"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="field mb-0">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Outlet Branch</label>
            <select
              className="select w-full"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
            >
              <option value="ALL">All Outlets & Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card flex items-center gap-3 p-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-textGray font-medium">Total Sales Revenue</div>
            <div className="text-lg font-bold text-gray-900">
              Rs. {totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-textGray font-medium">Total Completed Orders</div>
            <div className="text-lg font-bold text-gray-900">{totalOrdersCount} Orders</div>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <PieIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-textGray font-medium">Total Payment Receipts</div>
            <div className="text-lg font-bold text-gray-900">
              Rs. {totalPaymentSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-textGray font-medium">Net Operational Profit</div>
            <div className="text-lg font-bold text-gray-900">
              Rs. {Number(salesSummary?.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="card space-y-3">
          <div className="font-bold text-sm text-gray-900">Daily Sales Trend (Revenue vs Profit)</div>
          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-textGray">Loading chart...</div>
            ) : dailySales.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-textGray">No daily sales data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[...dailySales].reverse()}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => `Rs. ${value.toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="totalRevenue" name="Revenue (Rs)" stroke="#0d9488" strokeWidth={2} />
                  <Line type="monotone" dataKey="netProfit" name="Profit (Rs)" stroke="#16a34a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Payment Methods Breakdown Chart */}
        <div className="card space-y-3">
          <div className="font-bold text-sm text-gray-900">Payment Methods Breakdown</div>
          <div className="h-64 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-textGray">Loading chart...</div>
            ) : paymentSummary.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-textGray">No payment data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentSummary}>
                  <XAxis dataKey="paymentMethod" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => `Rs. ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="totalAmount" name="Payment Amount (Rs)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">{title} Data Breakdown</div>
          <div className="text-xs text-textGray">
            Period: {startDate} to {endDate}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">Generating report table...</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Date / Method</th>
                <th className="py-3 px-4">Orders Count</th>
                <th className="py-3 px-4">Revenue / Amount</th>
                <th className="py-3 px-4">Net Share / Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {dailySales.length > 0
                ? dailySales.map((row, idx) => (
                    <tr key={idx} className="hover:bg-patina-light/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{row.date}</td>
                      <td className="py-3 px-4 text-gray-700">{row.orderCount} Orders</td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        Rs. {Number(row.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">
                        Rs. {Number(row.netProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                : paymentSummary.map((row, idx) => (
                    <tr key={idx} className="hover:bg-patina-light/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-gray-900">{row.paymentMethod}</td>
                      <td className="py-3 px-4 text-gray-700">{row.orderCount} Orders</td>
                      <td className="py-3 px-4 font-bold text-gray-900">
                        Rs. {Number(row.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">{row.percentage}% Share</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        )}

        <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs text-gray-700 font-bold">
          <span>Reconciled Total Sales Revenue</span>
          <span className="text-teal-900 text-sm">
            Rs. {totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );
};
