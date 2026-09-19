"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { RawMaterial } from "@/types";

export default function RawMaterialSummaryReportPage() {
  const materials = db.rawMaterials;

  const columns: ReportColumn<RawMaterial>[] = [
    { header: "Raw Material Name", accessor: (r) => <span className="font-bold text-text-dark">{r.name}</span> },
    { header: "Code", accessor: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { header: "Base Unit", accessor: (r) => r.unitName || "-" },
    { header: "Procurement Cost", accessor: (r) => `${formatCurrency(r.costPerUnit)} / ${r.unitName}` },
    { header: "Current Warehouse Stock", accessor: (r) => <span className="font-bold text-patina">{r.currentStock ?? 0} {r.unitName}</span> },
    { header: "Total Asset Value", accessor: (r) => <span className="font-black text-text-dark">{formatCurrency((r.currentStock ?? 0) * r.costPerUnit)}</span>, align: "right" },
  ];

  const totalAssetVal = materials.reduce(
    (acc, m) => acc + (m.currentStock ?? 0) * m.costPerUnit,
    0
  );

  return (
    <ReportView
      title="Raw Material Summary Report"
      subtitle="Warehouse raw bulk ingredients valuation and inventory holdings"
      metrics={[
        { label: "Total Raw Ingredients", value: `${materials.length} Items`, highlight: true },
        { label: "Total Inventory Value", value: formatCurrency(totalAssetVal) },
        { label: "Storage Warehouses", value: "2 Facilities" },
        { label: "Active Suppliers", value: "3 Vendors" },
      ]}
      columns={columns}
      data={materials}
    />
  );
}
