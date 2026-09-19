"use client";

import React from "react";
import { ReportView, ReportColumn } from "@/components/reports/ReportView";
import { formatCurrency } from "@/lib/utils";

interface SalaryRow {
  employeeCode: string;
  name: string;
  designation: string;
  baseSalary: number;
  overtime: number;
  allowances: number;
  epfDeduction: number;
  netPayable: number;
}

const mockData: SalaryRow[] = [
  { employeeCode: "EMP-001", name: "Kasun Perera", designation: "Store Manager", baseSalary: 145000, overtime: 0, allowances: 8500, epfDeduction: 11600, netPayable: 141900 },
  { employeeCode: "EMP-002", name: "Nimali Silva", designation: "Head Cashier", baseSalary: 75000, overtime: 4500, allowances: 2500, epfDeduction: 6000, netPayable: 76000 },
  { employeeCode: "EMP-003", name: "Rohan Fernando", designation: "Senior Barista", baseSalary: 85000, overtime: 6200, allowances: 0, epfDeduction: 6800, netPayable: 84400 },
  { employeeCode: "EMP-004", name: "Dilani Bandara", designation: "Pastry Chef", baseSalary: 110000, overtime: 0, allowances: 4000, epfDeduction: 8800, netPayable: 105200 },
];

export default function SalaryReportPage() {
  const columns: ReportColumn<SalaryRow>[] = [
    { header: "Staff Code", accessor: (r) => <span className="font-mono text-xs">{r.employeeCode}</span> },
    { header: "Staff Name", accessor: (r) => <span className="font-bold text-text-dark">{r.name}</span> },
    { header: "Designation", accessor: (r) => r.designation },
    { header: "Base Pay", accessor: (r) => formatCurrency(r.baseSalary) },
    { header: "Overtime", accessor: (r) => <span className="text-emerald-700 font-bold">+{formatCurrency(r.overtime)}</span> },
    { header: "Allowances", accessor: (r) => <span className="text-blue-700 font-bold">+{formatCurrency(r.allowances)}</span> },
    { header: "EPF (8%)", accessor: (r) => <span className="text-red-600 font-bold">-{formatCurrency(r.epfDeduction)}</span> },
    { header: "Net Salary (LKR)", accessor: (r) => <span className="font-black text-patina">{formatCurrency(r.netPayable)}</span>, align: "right" },
  ];

  const totalNet = mockData.reduce((acc, s) => acc + s.netPayable, 0);

  return (
    <ReportView
      title="Salary & Compensation Statement"
      subtitle="Monthly payroll disbursements, overtime allowances, and statutory EPF/ETF contributions"
      metrics={[
        { label: "Total Net Payroll Outflow", value: formatCurrency(totalNet), highlight: true },
        { label: "Total Overtime Disbursed", value: "Rs. 10,700.00" },
        { label: "Transport & Allowances", value: "Rs. 15,000.00" },
        { label: "Statutory EPF Withheld", value: "Rs. 33,200.00" },
      ]}
      columns={columns}
      data={mockData}
    />
  );
}
