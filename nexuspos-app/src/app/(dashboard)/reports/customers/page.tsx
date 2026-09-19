"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { Customer } from "@/types";

export default function CustomersReportPage() {
  const customers = db.customers;

  const columns: ReportColumn<Customer>[] = [
    { header: "Customer Code", accessor: (r) => <span className="font-mono text-xs">{r.customerCode}</span> },
    { header: "Customer Name", accessor: (r) => <span className="font-bold text-text-dark">{r.name}</span> },
    { header: "Mobile", accessor: (r) => r.mobile },
    { header: "Membership Tier", accessor: (r) => r.groupName || "-" },
    { header: "Loyalty Points", accessor: (r) => <span className="font-bold text-amber-600">{r.loyaltyPoints} pts</span> },
    { header: "Credit Limit", accessor: (r) => formatCurrency(r.creditLimit) },
    { header: "Receivables Outstanding", accessor: (r) => <span className="font-black text-patina">{formatCurrency(r.outstandingBalance)}</span>, align: "right" },
  ];

  const totalReceivables = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);

  return (
    <ReportView
      title="Customers & Receivables Ledger"
      subtitle="Customer directory, accumulated loyalty points, credit limits, and outstanding balances"
      metrics={[
        { label: "Total Receivables", value: formatCurrency(totalReceivables), highlight: true },
        { label: "Total Accounts", value: `${customers.length} Customers` },
        { label: "Total Loyalty Points", value: "6,990 Points" },
        { label: "Total Credit Facility", value: "Rs. 210,000.00" },
      ]}
      columns={columns}
      data={customers}
    />
  );
}
