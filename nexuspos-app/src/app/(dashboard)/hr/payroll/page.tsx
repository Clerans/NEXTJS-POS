"use client";

import React, { useState } from "react";
import { Plus, DollarSign, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { PayrollRecord } from "@/types";
import { toast } from "sonner";

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([
    {
      id: 1,
      employeeId: 1,
      employeeName: "Kasun Perera",
      employeeCode: "EMP-001",
      monthYear: "August 2026",
      baseAmount: 145000,
      overtimeAmount: 0,
      claimsAmount: 8500,
      deductionsAmount: 11600,
      netPay: 141900,
      status: "PROCESSED",
    },
    {
      id: 2,
      employeeId: 2,
      employeeName: "Nimali Silva",
      employeeCode: "EMP-002",
      monthYear: "August 2026",
      baseAmount: 75000,
      overtimeAmount: 4500,
      claimsAmount: 2500,
      deductionsAmount: 6000,
      netPay: 76000,
      status: "PROCESSED",
    },
    {
      id: 3,
      employeeId: 3,
      employeeName: "Rohan Fernando",
      employeeCode: "EMP-003",
      monthYear: "August 2026",
      baseAmount: 85000,
      overtimeAmount: 6200,
      claimsAmount: 0,
      deductionsAmount: 6800,
      netPay: 84400,
      status: "PROCESSED",
    },
  ]);

  const totalPayroll = payroll.reduce((acc, p) => acc + p.netPay, 0);

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <div className="page-sub">
            Monthly salary calculations, EPF/ETF statutory deductions, overtime, and payslips
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.success("Drafted automated payroll calculations for current month!")}
          className="flex items-center gap-1.5"
        >
          <DollarSign className="w-4 h-4" /> Run Monthly Payroll
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Current Month Payroll Summary</div>
          <div className="text-xs font-black text-patina">
            Total Net Salary Outflow: {formatCurrency(totalPayroll)}
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Employee Details</th>
              <th>Month / Period</th>
              <th>Base Salary</th>
              <th>Overtime Pay</th>
              <th>Transport Claims</th>
              <th>Deductions (EPF)</th>
              <th>Net Take-Home Pay</th>
              <th>Status</th>
              <th className="text-right">Payslip</th>
            </tr>
          </thead>
          <tbody>
            {payroll.map((p) => (
              <tr key={p.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark">
                    {p.employeeName}
                  </div>
                  <div className="text-[10px] text-text-gray font-mono">
                    {p.employeeCode}
                  </div>
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {p.monthYear}
                </td>
                <td className="text-xs font-semibold text-text-dark">
                  {formatCurrency(p.baseAmount)}
                </td>
                <td className="text-xs text-emerald-700 font-bold">
                  +{formatCurrency(p.overtimeAmount)}
                </td>
                <td className="text-xs text-blue-700 font-bold">
                  +{formatCurrency(p.claimsAmount)}
                </td>
                <td className="text-xs text-red-600 font-bold">
                  -{formatCurrency(p.deductionsAmount)}
                </td>
                <td className="font-black text-xs text-patina">
                  {formatCurrency(p.netPay)}
                </td>
                <td>
                  <Badge variant="green">{p.status}</Badge>
                </td>
                <td className="text-right actions-cell">
                  <button
                    className="act-btn"
                    title="Print Payslip"
                    onClick={() =>
                      toast.info(`Generating official payslip slip for ${p.employeeName}`)
                    }
                  >
                    <FileText className="w-4 h-4 text-patina" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
