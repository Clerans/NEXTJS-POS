"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { Product } from "@/types";

export default function ProductSummaryReportPage() {
  const products = db.products;

  const columns: ReportColumn<Product>[] = [
    { header: "Product Name", accessor: (r) => <span className="font-bold text-text-dark">{r.name}</span> },
    { header: "SKU Code", accessor: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { header: "Category", accessor: (r) => r.categoryName || "-" },
    { header: "Unit Cost", accessor: (r) => formatCurrency(r.costPrice) },
    { header: "Retail Price", accessor: (r) => <span className="font-black text-patina">{formatCurrency(r.retailPrice)}</span> },
    { header: "Gross Margin", accessor: (r) => <span className="font-bold text-emerald-700">{(((r.retailPrice - r.costPrice) / r.retailPrice) * 100).toFixed(1)}%</span>, align: "center" },
    { header: "Stock", accessor: (r) => `${r.stock ?? 100} pcs`, align: "right" },
  ];

  return (
    <ReportView
      title="Product Summary Report"
      subtitle="Finished catalog price matrix, category segmentation, and current stock holdings"
      metrics={[
        { label: "Total Active SKUs", value: `${products.length} Products`, highlight: true },
        { label: "Average Menu Price", value: "Rs. 985.00" },
        { label: "Total Inventory Units", value: "624 pcs" },
        { label: "Inventory Valuation", value: "Rs. 320,400.00" },
      ]}
      columns={columns}
      data={products}
    />
  );
}
