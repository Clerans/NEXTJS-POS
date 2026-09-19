"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { Badge } from "@/components/ui/Badge";

interface StockAlertRow {
  itemName: string;
  type: string;
  currentStock: string;
  reorderLevel: string;
  shortage: string;
  urgency: "CRITICAL" | "HIGH" | "MEDIUM";
}

const mockData: StockAlertRow[] = [
  { itemName: "Monin Caramel Flavored Syrup", type: "Raw Material", currentStock: "2.0 L", reorderLevel: "5.0 L", shortage: "-3.0 L", urgency: "CRITICAL" },
  { itemName: "Belgian Dark Chocolate Callets 70%", type: "Raw Material", currentStock: "4.2 kg", reorderLevel: "8.0 kg", shortage: "-3.8 kg", urgency: "HIGH" },
  { itemName: "New York Cheesecake Slice", type: "Finished Product", currentStock: "2 pcs", reorderLevel: "6 pcs", shortage: "-4 pcs", urgency: "HIGH" },
  { itemName: "Grilled Smoked Chicken Sandwich", type: "Finished Product", currentStock: "3 pcs", reorderLevel: "8 pcs", shortage: "-5 pcs", urgency: "MEDIUM" },
];

export default function StockAlertsReportPage() {
  const columns: ReportColumn<StockAlertRow>[] = [
    { header: "Material / Product Name", accessor: (r) => <span className="font-bold text-text-dark">{r.itemName}</span> },
    { header: "Type", accessor: (r) => <Badge variant={r.type === "Finished Product" ? "blue" : "orange"}>{r.type}</Badge> },
    { header: "Current Stock", accessor: (r) => <span className="font-bold text-red-600">{r.currentStock}</span> },
    { header: "Threshold Level", accessor: (r) => r.reorderLevel },
    { header: "Deficit Shortage", accessor: (r) => <span className="font-bold text-red-600">{r.shortage}</span> },
    { header: "Urgency", accessor: (r) => <Badge variant={r.urgency === "CRITICAL" ? "red" : r.urgency === "HIGH" ? "orange" : "gray"}>{r.urgency}</Badge>, align: "right" },
  ];

  return (
    <ReportView
      title="Stock Alerts & Reorder Report"
      subtitle="Audit of all inventory items below minimum safety threshold levels"
      metrics={[
        { label: "Items Under Threshold", value: "4 Items", highlight: true },
        { label: "Critical Stockouts", value: "1 Item" },
        { label: "High Priority Reorders", value: "2 Items" },
        { label: "Estimated Restock Cost", value: "Rs. 45,200.00" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
