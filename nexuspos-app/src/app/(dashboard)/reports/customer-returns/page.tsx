"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CustReturnRow {
  returnNo: string;
  orderId: string;
  customerName: string;
  productName: string;
  qty: number;
  reason: string;
  refundAmount: number;
  date: string;
}

const mockData: CustReturnRow[] = [
  { returnNo: "RET-CUST-2026-001", orderId: "ORD-20260803-002", customerName: "Dr. Dinesh Jayawardena", productName: "Iced Caramel Macchiato", qty: 1, reason: "Customer requested hot beverage replacement", refundAmount: 950, date: "2026-08-03" },
  { returnNo: "RET-CUST-2026-002", orderId: "ORD-20260802-045", customerName: "Walk-in Guest", productName: "Artisan Butter Croissant", qty: 2, reason: "Cold serve preference return", refundAmount: 1100, date: "2026-08-02" },
];

export default function CustomerReturnsReportPage() {
  const columns: ReportColumn<CustReturnRow>[] = [
    { header: "Return Slip #", accessor: (r) => <span className="font-mono text-xs font-bold text-patina">{r.returnNo}</span> },
    { header: "Original Order", accessor: (r) => <span className="font-mono text-xs">{r.orderId}</span> },
    { header: "Customer", accessor: (r) => r.customerName },
    { header: "Returned Product", accessor: (r) => <span className="font-semibold text-text-dark">{r.productName} (x{r.qty})</span> },
    { header: "Reason", accessor: (r) => <span className="text-xs text-text-gray">{r.reason}</span> },
    { header: "Date", accessor: (r) => formatDate(r.date) },
    { header: "Refund Value", accessor: (r) => <span className="font-black text-red-600">{formatCurrency(r.refundAmount)}</span>, align: "right" },
  ];

  const totalRefund = mockData.reduce((acc, r) => acc + r.refundAmount, 0);

  return (
    <ReportView
      title="Customer Returns & Refunds Report"
      subtitle="Detailed log of register order returns, refund justifications, and restocking audit"
      metrics={[
        { label: "Total Refund Claims", value: formatCurrency(totalRefund), highlight: true },
        { label: "Total Returned Units", value: "3 Items" },
        { label: "Return Frequency Rate", value: "0.12%" },
        { label: "Resolved Customer Claims", value: "100%" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
