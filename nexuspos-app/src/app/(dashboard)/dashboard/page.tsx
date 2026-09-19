"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CircleDollarSign,
  Users,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowRight,
  Coffee,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const [trendPeriod, setTrendPeriod] = useState<string>("This Week");
  const [orderTypePeriod, setOrderTypePeriod] = useState<string>("This Month");

  // Reference Metrics
  const metrics = {
    totalSales: 1845600,
    activeCustomers: 1568,
    monthlyGrowth: 18.4,
    totalOrders: 3240,
  };

  // Sales trend chart data
  const chartDataWeekly = [
    { day: "Mon", sales: 185000 },
    { day: "Tue", sales: 220000 },
    { day: "Wed", sales: 195000 },
    { day: "Thu", sales: 260000 },
    { day: "Fri", sales: 340000 },
    { day: "Sat", sales: 380000 },
    { day: "Sun", sales: 265600 },
  ];

  const chartDataMonthly = [
    { day: "Week 1", sales: 420000 },
    { day: "Week 2", sales: 460000 },
    { day: "Week 3", sales: 485000 },
    { day: "Week 4", sales: 480600 },
  ];

  const chartData = trendPeriod === "This Month" ? chartDataMonthly : chartDataWeekly;

  // Orders by type breakdown
  const ordersByType = {
    takeawayCount: 1425,
    takeawayPercentage: 44,
    dineInCount: 1260,
    dineInPercentage: 39,
    deliveryCount: 555,
    deliveryPercentage: 17,
    topType: "Take Away",
    topTypeCount: 1425,
  };

  // Recent sales items
  const recentSales = [
    {
      id: "ORD-20260803-014",
      customer: "Dr. Dinesh Jayawardena",
      items: "2x Caffe Latte, 1x Croissant",
      amount: 2250,
      paymentMethod: "CARD",
      time: "10:45 AM",
      status: "COMPLETED",
    },
    {
      id: "ORD-20260803-013",
      customer: "Walk-in Customer",
      items: "1x Caramel Macchiato, 1x Panini",
      amount: 2050,
      paymentMethod: "CASH",
      time: "10:32 AM",
      status: "COMPLETED",
    },
    {
      id: "ORD-20260803-012",
      customer: "Millennium IT Corp",
      items: "5x Cappuccino, 5x Brownies",
      amount: 7750,
      paymentMethod: "CREDIT",
      time: "10:15 AM",
      status: "COMPLETED",
    },
    {
      id: "ORD-20260803-011",
      customer: "Sachini Gamage",
      items: "1x Cold Brew Special",
      amount: 750,
      paymentMethod: "CASH",
      time: "09:58 AM",
      status: "COMPLETED",
    },
    {
      id: "ORD-20260803-010",
      customer: "Walk-in Customer",
      items: "1x Chicken Alfredo Pasta",
      amount: 1650,
      paymentMethod: "CARD",
      time: "09:40 AM",
      status: "COMPLETED",
    },
  ];

  // Low stock alert items
  const lowStockAlerts = [
    {
      name: "Belgian Dark Chocolate Callets 70%",
      type: "Raw Material",
      stock: 4.2,
      reorder: 8.0,
      unit: "kg",
      urgency: "HIGH",
    },
    {
      name: "Monin Caramel Flavored Syrup",
      type: "Raw Material",
      stock: 2.0,
      reorder: 5.0,
      unit: "L",
      urgency: "CRITICAL",
    },
    {
      name: "Grilled Smoked Chicken Sandwich",
      type: "Product",
      stock: 3,
      reorder: 8,
      unit: "pcs",
      urgency: "MEDIUM",
    },
    {
      name: "New York Cheesecake Slice",
      type: "Product",
      stock: 2,
      reorder: 6,
      unit: "pcs",
      urgency: "HIGH",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-text-dark tracking-tight">
          Dashboard Overview
        </h1>
        <p className="text-xs text-text-gray font-medium mt-0.5">
          Real-time enterprise metrics and store operational performance
        </p>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-white p-4.5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
          <div className="stat-label flex items-center justify-between text-xs font-semibold text-text-gray mb-2">
            <span>Total Sales</span>
            <CircleDollarSign className="w-4 h-4 text-text-dark" />
          </div>
          <div className="stat-value text-xl font-black text-text-dark">
            {formatCurrency(metrics.totalSales)}
          </div>
        </div>

        <div className="card bg-white p-4.5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
          <div className="stat-label flex items-center justify-between text-xs font-semibold text-text-gray mb-2">
            <span>Active Customers</span>
            <Users className="w-4 h-4 text-text-gray" />
          </div>
          <div className="stat-value text-xl font-black text-text-dark">
            {metrics.activeCustomers.toLocaleString("en-US")}
          </div>
        </div>

        <div className="card bg-white p-4.5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
          <div className="stat-label flex items-center justify-between text-xs font-semibold text-text-gray mb-2">
            <span>Monthly Growth</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="stat-value text-xl font-black text-emerald-600">
            +{metrics.monthlyGrowth}%
          </div>
        </div>

        <div className="card bg-white p-4.5 rounded-xl border border-border shadow-xs hover:shadow-md transition-shadow">
          <div className="stat-label flex items-center justify-between text-xs font-semibold text-text-gray mb-2">
            <span>Monthly Orders</span>
            <Package className="w-4 h-4 text-text-gray" />
          </div>
          <div className="stat-value text-xl font-black text-text-dark">
            {metrics.totalOrders.toLocaleString("en-US")}
          </div>
        </div>
      </div>

      {/* Middle Panels: Sales Trend & Orders by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Trend Chart (Col 7) */}
        <div className="lg:col-span-7 card bg-white p-5 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-text-dark">Sales Trend</h2>
            <select
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value)}
              className="select border border-border rounded-lg px-2.5 py-1 text-xs font-semibold bg-white"
            >
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
              >
                <XAxis dataKey="day" hide />
                <YAxis hide />
                <Tooltip
                  formatter={(value: any) => [
                    formatCurrency(Number(value || 0)),
                    "Sales",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#004953"
                  strokeWidth={3}
                  dot={{ fill: "#004953", stroke: "#004953", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-xs text-text-gray mt-3 pt-2 border-t border-border/50">
            <span>Period: {trendPeriod}</span>
            <span className="font-bold text-text-dark">
              Total: {formatCurrency(metrics.totalSales)}
            </span>
          </div>
        </div>

        {/* Orders by Type (Col 5) */}
        <div className="lg:col-span-5 card bg-white p-5 rounded-xl border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm text-text-dark">Orders by Type</h2>
          </div>

          {/* Time Filter Pills */}
          <div className="flex items-center gap-1.5 mb-4">
            {["Today", "This Week", "This Month"].map((p) => (
              <button
                key={p}
                onClick={() => setOrderTypePeriod(p)}
                className={
                  orderTypePeriod === p
                    ? "px-3.5 py-1 text-xs font-semibold rounded-full text-white shadow-xs"
                    : "px-3 py-1 text-xs font-semibold rounded-md text-text-gray hover:bg-slate-100 transition-colors"
                }
                style={
                  orderTypePeriod === p
                    ? { backgroundColor: "#004953" }
                    : undefined
                }
              >
                {p}
              </button>
            ))}
          </div>

          {/* Breakdown Header % */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs border-b border-border/50 pb-3 mb-3">
            <div>
              <div className="text-[11px] text-text-gray font-medium">Take Away</div>
              <div className="font-bold text-text-dark text-sm">
                {ordersByType.takeawayPercentage}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-text-gray font-medium">Dine-In</div>
              <div className="font-bold text-text-dark text-sm">
                {ordersByType.dineInPercentage}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-text-gray font-medium">Delivery</div>
              <div className="font-bold text-text-dark text-sm">
                {ordersByType.deliveryPercentage}%
              </div>
            </div>
          </div>

          {/* Highlighted Top Order Type Card */}
          <div className="bg-[#E8F3F5] rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-text-dark">
              <span className="w-2.5 h-2.5 rounded-full bg-[#004953] inline-block" />
              {ordersByType.topType}
            </div>
            <div className="text-xs font-bold text-text-dark">
              {ordersByType.topTypeCount} orders
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panels: Recent Sales & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Sales */}
        <div className="card bg-white p-5 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-text-dark">Recent Sales</h2>
            <Link
              href="/sales"
              className="text-xs text-patina font-bold hover:underline flex items-center gap-1"
            >
              View All Sales <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-patina-light/50">
                  <td>
                    <div className="font-bold text-xs text-text-dark">
                      {sale.id}
                    </div>
                    <div className="text-[10px] text-text-gray">{sale.time}</div>
                  </td>
                  <td>
                    <div className="font-semibold text-xs text-text-dark">
                      {sale.customer}
                    </div>
                    <div className="text-[11px] text-text-gray truncate max-w-[140px]">
                      {sale.items}
                    </div>
                  </td>
                  <td className="font-bold text-xs text-text-dark">
                    {formatCurrency(sale.amount)}
                  </td>
                  <td>
                    <Badge
                      variant={
                        sale.paymentMethod === "CARD"
                          ? "blue"
                          : sale.paymentMethod === "CREDIT"
                          ? "purple"
                          : "green"
                      }
                    >
                      {sale.paymentMethod}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alerts */}
        <div className="card bg-white p-5 rounded-xl border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-sm text-text-dark">
                Stock Reorder Alerts
              </h2>
            </div>
            <Link
              href="/products/stock-alerts"
              className="text-xs text-patina font-bold hover:underline flex items-center gap-1"
            >
              Manage Alerts <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <th>Item Details</th>
                <th>Current</th>
                <th>Threshold</th>
                <th>Urgency</th>
              </tr>
            </thead>
            <tbody>
              {lowStockAlerts.map((alert, idx) => (
                <tr key={idx} className="hover:bg-patina-light/50">
                  <td>
                    <div className="font-bold text-xs text-text-dark">
                      {alert.name}
                    </div>
                    <div className="text-[10px] text-text-gray">{alert.type}</div>
                  </td>
                  <td className="font-bold text-xs text-red-600">
                    {alert.stock} {alert.unit}
                  </td>
                  <td className="text-xs text-text-gray font-medium">
                    {alert.reorder} {alert.unit}
                  </td>
                  <td>
                    <Badge
                      variant={
                        alert.urgency === "CRITICAL"
                          ? "red"
                          : alert.urgency === "HIGH"
                          ? "orange"
                          : "gray"
                      }
                    >
                      {alert.urgency}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
