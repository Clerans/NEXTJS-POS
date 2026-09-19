"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface SupReturnRow {
  returnNo: string;
  supplierName: string;
  materialName: string;
  qty: number;
  unit: string;
  reason: string;
  refundAmount: number;
  date: string;
  status: string;
}

const mockData: SupReturnRow[] = [
  { returnNo: "RET-SUP-2026-001", supplierName: "Ceylon Coffee Roasters Ltd", materialName: "Premium Arabica Coffee Beans", qty: 5, unit: "kg", reason: "Packaging damaged in transit", refundAmount: 32500, date: "2026-08-02", status: "APPROVED" },
  { returnNo: "RET-SUP-2026-002", supplierName: "Kotmale Dairies PLC", materialName: "Fresh Full-Cream Dairy Milk", qty: 20, unit: "L", reason: "Near-expiry delivery batch", refundAmount: 9600, date: "2026-07-29", status: "APPROVED" },
];

export default function SupplierReturnsReportPage() {
  const columns: ReportColumn<SupReturnRow>[] = [
    { header: "Debit Note #", accessor: (r) => <span className="font-mono text-xs font-bold text-patina">{r.returnNo}</span> },
    { header: "Supplier Vendor", accessor: (r) => <span className="font-semibold text-text-dark">{r.supplierName}</span> },
    { header: "Returned Raw Item", accessor: (r) => `${r.materialName} (${r.qty} ${r.unit})` },
    { header: "Reason", accessor: (r) => <span className="text-xs text-text-gray">{r.reason}</span> },
    { header: "Return Date", accessor: (r) => formatDate(r.date) },
    { header: "Status", accessor: (r) => <Badge variant="green">{r.status}</Badge> },
    { header: "Debit Value", accessor: (r) => <span className="font-black text-patina">{formatCurrency(r.refundAmount)}</span>, align: "right" },
  ];

  const totalRefund = mockData.reduce((acc, r) => acc + r.refundAmount, 0);

  return (
    <ReportView
      title="Supplier Returns & Debit Notes Report"
      subtitle="Comprehensive audit of vendor stock returns, quality rejections, and debit note recoveries"
      metrics={[
        { label: "Total Debit Note Claims", value: formatCurrency(totalRefund), highlight: true },
        { label: "Dispatched Claims", value: "2 Notes" },
        { label: "Vendor Acceptance", value: "100%" },
        { label: "Damaged Stock Recovery", value: "Rs. 42,100.00" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
