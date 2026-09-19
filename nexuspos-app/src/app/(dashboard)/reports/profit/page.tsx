"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency } from "@/lib/utils";

interface ProfitCategoryRow {
  category: string;
  grossRevenue: number;
  totalCOGS: number;
  grossProfit: number;
  profitMarginPercent: number;
}

const mockData: ProfitCategoryRow[] = [
  { category: "Beverages (Coffee & Teas)", grossRevenue: 485000, totalCOGS: 155200, grossProfit: 329800, profitMarginPercent: 68.0 },
  { category: "Bakery & Viennoiserie", grossRevenue: 245000, totalCOGS: 88200, grossProfit: 156800, profitMarginPercent: 64.0 },
  { category: "Savory Items & Gourmet Sandwiches", grossRevenue: 310000, totalCOGS: 124000, grossProfit: 186000, profitMarginPercent: 60.0 },
  { category: "Desserts & Slices", grossRevenue: 180000, totalCOGS: 68400, grossProfit: 111600, profitMarginPercent: 62.0 },
];

export default function ProfitReportPage() {
  const columns: ReportColumn<ProfitCategoryRow>[] = [
    { header: "Product Category", accessor: (r) => <span className="font-bold text-text-dark">{r.category}</span> },
    { header: "Gross Sales Revenue", accessor: (r) => formatCurrency(r.grossRevenue) },
    { header: "Cost of Goods Sold (COGS)", accessor: (r) => <span className="text-red-600">-{formatCurrency(r.totalCOGS)}</span> },
    { header: "Gross Net Profit (LKR)", accessor: (r) => <span className="font-black text-patina">{formatCurrency(r.grossProfit)}</span> },
    { header: "Gross Margin %", accessor: (r) => <span className="font-bold text-emerald-700">{r.profitMarginPercent}%</span>, align: "right" },
  ];

  const totalRevenue = mockData.reduce((acc, p) => acc + p.grossRevenue, 0);
  const totalProfit = mockData.reduce((acc, p) => acc + p.grossProfit, 0);

  return (
    <ReportView
      title="Net Profit & Financial Performance Statement"
      subtitle="Category profitability, COGS ingredient margins, and contribution margins"
      metrics={[
        { label: "Total Gross Profit", value: formatCurrency(totalProfit), highlight: true },
        { label: "Overall Revenue", value: formatCurrency(totalRevenue) },
        { label: "Blended Profit Margin", value: "64.8%" },
        { label: "Top Contributor", value: "Beverages (68.0%)" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
