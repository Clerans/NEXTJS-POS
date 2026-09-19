"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency } from "@/lib/utils";

interface ProductSaleRow {
  sku: string;
  name: string;
  category: string;
  unitsSold: number;
  unitPrice: number;
  totalRevenue: number;
  sharePercent: number;
}

const mockData: ProductSaleRow[] = [
  { sku: "BEV-001", name: "Caffe Latte (Large)", category: "Beverages", unitsSold: 420, unitPrice: 850, totalRevenue: 357000, sharePercent: 28.5 },
  { sku: "SAV-001", name: "Grilled Smoked Chicken Sandwich", category: "Savory Items", unitsSold: 210, unitPrice: 1250, totalRevenue: 262500, sharePercent: 21.0 },
  { sku: "BEV-003", name: "Iced Caramel Macchiato", category: "Beverages", unitsSold: 240, unitPrice: 950, totalRevenue: 228000, sharePercent: 18.2 },
  { sku: "BAK-001", name: "Artisan Butter Croissant", category: "Bakery", unitsSold: 320, unitPrice: 550, totalRevenue: 176000, sharePercent: 14.1 },
  { sku: "DES-001", name: "New York Cheesecake Slice", category: "Desserts", unitsSold: 140, unitPrice: 950, totalRevenue: 133000, sharePercent: 10.6 },
];

export default function ProductWiseSalesReportPage() {
  const columns: ReportColumn<ProductSaleRow>[] = [
    { header: "SKU Code", accessor: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { header: "Menu Item", accessor: (r) => <span className="font-bold text-text-dark">{r.name}</span> },
    { header: "Category", accessor: (r) => r.category },
    { header: "Units Sold", accessor: (r) => <span className="font-bold text-patina">{r.unitsSold} pcs</span>, align: "center" },
    { header: "Avg Price", accessor: (r) => formatCurrency(r.unitPrice) },
    { header: "Revenue Contribution %", accessor: (r) => `${r.sharePercent}%`, align: "center" },
    { header: "Total Gross Sales", accessor: (r) => <span className="font-black text-text-dark">{formatCurrency(r.totalRevenue)}</span>, align: "right" },
  ];

  const totalRev = mockData.reduce((acc, p) => acc + p.totalRevenue, 0);
  const totalUnits = mockData.reduce((acc, p) => acc + p.unitsSold, 0);

  return (
    <ReportView
      title="Product-Wise Sales Analysis"
      subtitle="Ranked item volume velocity, unit sales quantities, and top revenue contributors"
      metrics={[
        { label: "Ranked Item Revenue", value: formatCurrency(totalRev), highlight: true },
        { label: "Total Units Dispensed", value: `${totalUnits} Items` },
        { label: "#1 Best Seller SKU", value: "Caffe Latte (420 pcs)" },
        { label: "#1 Revenue Generator", value: "Caffe Latte (Rs. 357k)" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
