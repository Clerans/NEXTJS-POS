"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { Supplier } from "@/types";

export default function SuppliersReportPage() {
  const suppliers = db.suppliers;

  const columns: ReportColumn<Supplier>[] = [
    { header: "Supplier Code", accessor: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { header: "Supplier Name", accessor: (r) => <span className="font-bold text-text-dark">{r.name}</span> },
    { header: "Contact Person", accessor: (r) => r.contactPerson || "-" },
    { header: "Phone Hotline", accessor: (r) => r.phone },
    { header: "Payment Terms", accessor: (r) => r.paymentTerms },
    { header: "Payable Outstanding", accessor: (r) => <span className="font-black text-patina">{formatCurrency(r.balance ?? 0)}</span>, align: "right" },
  ];

  const totalPayable = suppliers.reduce((acc, s) => acc + (s.balance ?? 0), 0);

  return (
    <ReportView
      title="Suppliers & Payables Statement"
      subtitle="Vendor directory, payment terms, and open procurement account payables"
      metrics={[
        { label: "Total Outstanding Payables", value: formatCurrency(totalPayable), highlight: true },
        { label: "Registered Vendors", value: `${suppliers.length} Suppliers` },
        { label: "Overdue Balance", value: "Rs. 0.00" },
        { label: "Average Credit Terms", value: "30 Days" },
      ]}
      columns={columns}
      data={suppliers}
    />
  );
}
