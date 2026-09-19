"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency, formatDate } from "@/lib/utils";

interface WastageRow {
  date: string;
  itemName: string;
  type: string;
  quantityWasted: string;
  reason: string;
  lossValue: number;
  reportedBy: string;
}

const mockData: WastageRow[] = [
  { date: "2026-08-03", itemName: "Fresh Full-Cream Dairy Milk", type: "Raw Material", quantityWasted: "2.5 L", reason: "Expired shelf life after open refrigeration", lossValue: 1200, reportedBy: "Rohan Fernando" },
  { date: "2026-08-02", itemName: "Artisan Butter Croissant", type: "Finished Bakery", quantityWasted: "3 pcs", reason: "End of day shelf display clearance", lossValue: 570, reportedBy: "Dilani Bandara" },
  { date: "2026-08-01", itemName: "Smoked Chicken Breast Slices", type: "Raw Material", quantityWasted: "0.8 kg", reason: "Prep trimming loss & quality rejection", lossValue: 1920, reportedBy: "Dilani Bandara" },
];

export default function WastageReportPage() {
  const columns: ReportColumn<WastageRow>[] = [
    { header: "Date", accessor: (r) => formatDate(r.date) },
    { header: "Item Details", accessor: (r) => <span className="font-bold text-text-dark">{r.itemName}</span> },
    { header: "Classification", accessor: (r) => r.type },
    { header: "Wasted Qty", accessor: (r) => <span className="font-bold text-red-600">{r.quantityWasted}</span> },
    { header: "Reason Description", accessor: (r) => <span className="text-xs text-text-gray">{r.reason}</span> },
    { header: "Logged By", accessor: (r) => r.reportedBy },
    { header: "Financial Loss", accessor: (r) => <span className="font-black text-red-600">{formatCurrency(r.lossValue)}</span>, align: "right" },
  ];

  const totalLoss = mockData.reduce((acc, w) => acc + w.lossValue, 0);

  return (
    <ReportView
      title="Wastage & Spoilage Analysis Report"
      subtitle="Track kitchen ingredient spoilage, over-production shelf discard, and shrinkage loss"
      metrics={[
        { label: "Total Wastage Cost Loss", value: formatCurrency(totalLoss), highlight: true },
        { label: "Wastage vs Sales Ratio", value: "0.48%" },
        { label: "Bakery Shrinkage", value: "Rs. 570.00" },
        { label: "Dairy & Ingredient Loss", value: "Rs. 3,120.00" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
