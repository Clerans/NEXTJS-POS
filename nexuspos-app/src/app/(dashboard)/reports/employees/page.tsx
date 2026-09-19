"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency, formatDate } from "@/lib/utils";
import { db } from "@/lib/db";
import { Employee } from "@/types";

export default function EmployeesReportPage() {
  const employees = db.employees;

  const columns: ReportColumn<Employee>[] = [
    { header: "Staff Code", accessor: (r) => <span className="font-mono text-xs">{r.employeeCode}</span> },
    { header: "Staff Name", accessor: (r) => <span className="font-bold text-text-dark">{r.name}</span> },
    { header: "Role Designation", accessor: (r) => r.jobTitle },
    { header: "Assigned Outlet", accessor: (r) => r.branch },
    { header: "Contact Mobile", accessor: (r) => r.mobile },
    { header: "Hired Date", accessor: (r) => formatDate(r.hiredDate) },
    { header: "Base Salary", accessor: (r) => <span className="font-black text-patina">{formatCurrency(r.salary ?? 0)}</span>, align: "right" },
  ];

  const totalPayrollBase = employees.reduce((acc, e) => acc + (e.salary ?? 0), 0);

  return (
    <ReportView
      title="Employees & Headcount Report"
      subtitle="Staff roster directory, store branch assignments, and base compensation analysis"
      metrics={[
        { label: "Active Headcount", value: `${employees.length} Staff`, highlight: true },
        { label: "Total Monthly Base", value: formatCurrency(totalPayrollBase) },
        { label: "Operating Outlets", value: "3 Branches" },
        { label: "Average Tenure", value: "1.8 Years" },
      ]}
      columns={columns}
      data={employees}
    />
  );
}
