"use client";

import React, { useState } from "react";
import { Plus, RotateCcw, Search, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CustomerReturn } from "@/types";
import { toast } from "sonner";

export default function CustomerReturnsPage() {
  const [returns, setReturns] = useState<CustomerReturn[]>([
    {
      id: 1,
      returnNo: "RET-CUST-2026-001",
      orderId: "ORD-20260803-002",
      customerId: 1,
      customerName: "Dr. Dinesh Jayawardena",
      totalRefundAmount: 950,
      reason: "Incorrect preparation, switched for hot latte",
      status: "PROCESSED",
      createdAt: "2026-08-03",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Customer Returns &amp; Refunds</h1>
          <div className="page-sub">
            Process register customer sales returns, item exchanges, and cash/card refund slips
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening Customer Refund Prompt...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Issue Customer Return
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Customer Refund Ledger</div>
          <div className="text-xs text-text-gray">Total {returns.length} return slips</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Return Number</th>
              <th>Original POS Order #</th>
              <th>Customer</th>
              <th>Reason</th>
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
                <td className="text-xs text-patina font-mono font-bold">
                  {r.orderId}
                </td>
                <td className="font-semibold text-xs text-text-dark">
                  {r.customerName}
                </td>
                <td className="text-xs text-text-gray max-w-sm">{r.reason}</td>
                <td className="font-black text-xs text-red-600">
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
