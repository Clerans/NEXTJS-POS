"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { Product } from "@/types";

export default function ProductMarginReportPage() {
  const products = db.products;

  const columns: ReportColumn<Product>[] = [
    { header: "Menu Item", accessor: (r) => <span className="font-bold text-text-dark">{r.name}</span> },
    { header: "Category", accessor: (r) => r.categoryName || "-" },
    { header: "Outlet Cost", accessor: (r) => formatCurrency(r.costPrice) },
    { header: "Retail Price", accessor: (r) => formatCurrency(r.retailPrice) },
    { header: "Gross Profit Margin (Rs.)", accessor: (r) => <span className="font-bold text-patina">{formatCurrency(r.retailPrice - r.costPrice)}</span> },
    { header: "Margin %", accessor: (r) => <span className="font-black text-emerald-700">{(((r.retailPrice - r.costPrice) / r.retailPrice) * 100).toFixed(1)}%</span>, align: "right" },
  ];

  return (
    <ReportView
      title="Product Margin & Profitability Report"
      subtitle="Detailed cost of goods sold (COGS) analysis and percentage gross margin per menu SKU"
      metrics={[
        { label: "Average Menu Margin", value: "66.4%", highlight: true },
        { label: "Highest Margin Item", value: "Caffe Latte (67.1%)" },
        { label: "Lowest Margin Item", value: "Smoked Chicken (58.4%)" },
        { label: "Recipe-Based SKUs", value: "9 Products" },
      ]}
      columns={columns}
      data={products}
    />
  );
}
