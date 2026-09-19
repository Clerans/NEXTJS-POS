"use client";

import React, { useState } from "react";
import { Plus, RotateCcw, Search, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SupplierReturn } from "@/types";
import { toast } from "sonner";

export default function SupplierReturnsPage() {
  const [returns, setReturns] = useState<SupplierReturn[]>([
    {
      id: 1,
      returnNo: "RET-SUP-2026-001",
      supplierId: 1,
      supplierName: "Ceylon Coffee Roasters Ltd",
      totalRefundAmount: 32500,
      reason: "Packaging damaged during transit, beans unsealed",
      status: "APPROVED",
      createdAt: "2026-08-02",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Supplier Returns (Debit Notes)</h1>
          <div className="page-sub">
            Return damaged or expired raw materials to vendors and claim debit credit notes
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening Supplier Return Requisition...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Issue Supplier Return
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Vendor Return Records</div>
          <div className="text-xs text-text-gray">Total {returns.length} return claims</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Return Number</th>
              <th>Supplier Name</th>
              <th>Claim Reason</th>
              <th>Refund Amount</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {returns.map((r) => (
              <tr key={r.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark font-mono flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-patina" /> {r.returnNo}
                  </div>
                </td>
                <td className="font-semibold text-xs text-text-dark">
                  {r.supplierName}
                </td>
                <td className="text-xs text-text-gray max-w-sm">{r.reason}</td>
                <td className="font-black text-xs text-text-dark">
                  {formatCurrency(r.totalRefundAmount)}
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(r.createdAt)}
                </td>
                <td>
                  <Badge variant="green">{r.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
