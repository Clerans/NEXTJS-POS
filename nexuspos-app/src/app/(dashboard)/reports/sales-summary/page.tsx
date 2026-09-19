"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency } from "@/lib/utils";

interface DailySales {
  date: string;
  totalOrders: number;
  grossSales: number;
  discounts: number;
  netSales: number;
  tax: number;
  serviceCharge: number;
  grandTotal: number;
}

const mockData: DailySales[] = [
  { date: "2026-08-01", totalOrders: 112, grossSales: 215000, discounts: 12000, netSales: 203000, tax: 20300, serviceCharge: 18000, grandTotal: 241300 },
  { date: "2026-08-02", totalOrders: 135, grossSales: 268000, discounts: 15400, netSales: 252600, tax: 25260, serviceCharge: 22500, grandTotal: 300360 },
  { date: "2026-08-03", totalOrders: 98, grossSales: 194000, discounts: 8600, netSales: 185400, tax: 18540, serviceCharge: 16200, grandTotal: 220140 },
];

export default function SalesSummaryReportPage() {
  const columns: ReportColumn<DailySales>[] = [
    { header: "Date", accessor: (r) => <span className="font-bold">{r.date}</span> },
    { header: "Orders Count", accessor: (r) => `${r.totalOrders} orders`, align: "center" },
    { header: "Gross Sales", accessor: (r) => formatCurrency(r.grossSales) },
    { header: "Discounts", accessor: (r) => <span className="text-red-600">-{formatCurrency(r.discounts)}</span> },
    { header: "Net Sales", accessor: (r) => formatCurrency(r.netSales) },
    { header: "VAT / Tax", accessor: (r) => formatCurrency(r.tax) },
    { header: "Service Charge", accessor: (r) => formatCurrency(r.serviceCharge) },
    { header: "Grand Total", accessor: (r) => <span className="font-black text-patina">{formatCurrency(r.grandTotal)}</span>, align: "right" },
  ];

  return (
    <ReportView
      title="Sales Summary Report"
      subtitle="Comprehensive daily and periodical register revenues and tax breakdown"
      metrics={[
        { label: "Total Gross Revenue", value: "Rs. 677,000.00", highlight: true },
        { label: "Total Orders Processed", value: "345 Orders" },
        { label: "Discounts Deducted", value: "Rs. 36,000.00" },
        { label: "VAT & Service Collected", value: "Rs. 120,800.00" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
