"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency } from "@/lib/utils";

interface PaymentRow {
  method: string;
  transactionCount: number;
  totalCollected: number;
  percentage: number;
}

const mockData: PaymentRow[] = [
  { method: "Cash Payments", transactionCount: 184, totalCollected: 312500, percentage: 41.0 },
  { method: "Card (Visa / Mastercard)", transactionCount: 142, totalCollected: 365800, percentage: 48.0 },
  { method: "Corporate Credit Account", transactionCount: 19, totalCollected: 83500, percentage: 11.0 },
];

export default function PaymentsReportPage() {
  const columns: ReportColumn<PaymentRow>[] = [
    { header: "Payment Method", accessor: (r) => <span className="font-bold text-text-dark">{r.method}</span> },
    { header: "Total Transactions", accessor: (r) => `${r.transactionCount} txns`, align: "center" },
    { header: "Share of Total", accessor: (r) => <span className="font-bold text-patina">{r.percentage}%</span>, align: "center" },
    { header: "Total Collected (LKR)", accessor: (r) => <span className="font-black text-text-dark">{formatCurrency(r.totalCollected)}</span>, align: "right" },
  ];

  return (
    <ReportView
      title="Payments Collection Report"
      subtitle="Breakdown of customer settlements across Cash, Card, and Credit accounts"
      metrics={[
        { label: "Total Settlement Collected", value: "Rs. 761,800.00", highlight: true },
        { label: "Cash In Drawer", value: "Rs. 312,500.00" },
        { label: "Card Merchant Inflow", value: "Rs. 365,800.00" },
        { label: "Corporate Credit", value: "Rs. 83,500.00" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
