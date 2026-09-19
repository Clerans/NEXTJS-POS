"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ServiceChargeRow {
  date: string;
  dineInOrders: number;
  dineInFoodSubtotal: number;
  serviceChargeRate: number;
  serviceChargeCollected: number;
  poolSharePerStaff: number;
}

const mockData: ServiceChargeRow[] = [
  { date: "2026-08-01", dineInOrders: 54, dineInFoodSubtotal: 118000, serviceChargeRate: 10, serviceChargeCollected: 11800, poolSharePerStaff: 1475 },
  { date: "2026-08-02", dineInOrders: 68, dineInFoodSubtotal: 154000, serviceChargeRate: 10, serviceChargeCollected: 15400, poolSharePerStaff: 1925 },
  { date: "2026-08-03", dineInOrders: 42, dineInFoodSubtotal: 92000, serviceChargeRate: 10, serviceChargeCollected: 9200, poolSharePerStaff: 1150 },
];

export default function ServiceChargeReportPage() {
  const columns: ReportColumn<ServiceChargeRow>[] = [
    { header: "Date", accessor: (r) => formatDate(r.date) },
    { header: "Dine-In Orders", accessor: (r) => `${r.dineInOrders} covers`, align: "center" },
    { header: "Eligible Dine-In Subtotal", accessor: (r) => formatCurrency(r.dineInFoodSubtotal) },
    { header: "Service Charge %", accessor: (r) => `${r.serviceChargeRate}%`, align: "center" },
    { header: "Service Charge Collected", accessor: (r) => <span className="font-bold text-patina">{formatCurrency(r.serviceChargeCollected)}</span> },
    { header: "Est. Pool Share / Staff", accessor: (r) => <span className="font-black text-emerald-700">{formatCurrency(r.poolSharePerStaff)}</span>, align: "right" },
  ];

  const totalCollected = mockData.reduce((acc, s) => acc + s.serviceChargeCollected, 0);

  return (
    <ReportView
      title="Dine-In Service Charge Pool Report"
      subtitle="Audit of 10% dine-in service charge receipts and staff distribution pool entitlement"
      metrics={[
        { label: "Total Service Charge Pool", value: formatCurrency(totalCollected), highlight: true },
        { label: "Eligible Dine-In Covers", value: "164 Orders" },
        { label: "Active Staff Pool Members", value: "8 Employees" },
        { label: "Average Pool Share / Staff", value: "Rs. 4,550.00" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
