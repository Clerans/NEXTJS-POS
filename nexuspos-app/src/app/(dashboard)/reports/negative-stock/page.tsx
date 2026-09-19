"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface NegativeStockRow {
  sku: string;
  name: string;
  outlet: string;
  recordedBalance: string;
  policyStatus: string;
  lastSold: string;
}

const mockData: NegativeStockRow[] = [];

export default function NegativeStockReportPage() {
  const columns: ReportColumn<NegativeStockRow>[] = [
    { header: "SKU Code", accessor: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { header: "Item Name", accessor: (r) => <span className="font-bold text-text-dark">{r.name}</span> },
    { header: "Store Outlet", accessor: (r) => r.outlet },
    { header: "Deficit Recorded Balance", accessor: (r) => <span className="font-bold text-red-600">{r.recordedBalance}</span> },
    { header: "Negative Stock Policy", accessor: (r) => <Badge variant="green">{r.policyStatus}</Badge> },
    { header: "Last Transacted", accessor: (r) => formatDate(r.lastSold), align: "right" },
  ];

  return (
    <ReportView
      title="Negative Stock Exception Report"
      subtitle="Audit log of register overrides and inventory accounts with negative stock balances"
      metrics={[
        { label: "Negative Balance Items", value: "0 Items", highlight: true },
        { label: "Policy Compliance", value: "100% Strict" },
        { label: "Inventory Variances", value: "None Detected" },
        { label: "Negative Stock Allowed", value: "Disabled in Settings" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
