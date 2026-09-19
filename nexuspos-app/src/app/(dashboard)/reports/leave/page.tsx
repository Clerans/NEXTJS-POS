"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface LeaveRow {
  employeeCode: string;
  name: string;
  designation: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "APPROVED" | "PENDING";
}

const mockData: LeaveRow[] = [
  { employeeCode: "EMP-003", name: "Rohan Fernando", designation: "Senior Barista", leaveType: "ANNUAL", startDate: "2026-08-10", endDate: "2026-08-12", days: 3, status: "APPROVED" },
  { employeeCode: "EMP-002", name: "Nimali Silva", designation: "Head Cashier", leaveType: "CASUAL", startDate: "2026-07-28", endDate: "2026-07-28", days: 1, status: "APPROVED" },
  { employeeCode: "EMP-004", name: "Dilani Bandara", designation: "Pastry Chef", leaveType: "MEDICAL", startDate: "2026-07-15", endDate: "2026-07-16", days: 2, status: "APPROVED" },
];

export default function LeaveReportPage() {
  const columns: ReportColumn<LeaveRow>[] = [
    { header: "Staff Code", accessor: (r) => <span className="font-mono text-xs">{r.employeeCode}</span> },
    { header: "Staff Name", accessor: (r) => <span className="font-bold text-text-dark">{r.name}</span> },
    { header: "Designation", accessor: (r) => r.designation },
    { header: "Leave Classification", accessor: (r) => <Badge variant="blue">{r.leaveType}</Badge> },
    { header: "Start Date", accessor: (r) => formatDate(r.startDate) },
    { header: "End Date", accessor: (r) => formatDate(r.endDate) },
    { header: "Total Days", accessor: (r) => <span className="font-bold text-patina">{r.days} Days</span>, align: "center" },
    { header: "Status", accessor: (r) => <Badge variant="green">{r.status}</Badge>, align: "right" },
  ];

  return (
    <ReportView
      title="Employee Leave & Absenteeism Report"
      subtitle="Annual, casual, and medical leave utilization audit across departments"
      metrics={[
        { label: "Total Leave Days Taken", value: "6 Days", highlight: true },
        { label: "Annual Leaves", value: "3 Days" },
        { label: "Casual Leaves", value: "1 Day" },
        { label: "Medical Leaves", value: "2 Days" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
