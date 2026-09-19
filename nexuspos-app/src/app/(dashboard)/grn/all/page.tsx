"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ClipboardCheck, Search, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { db } from "@/lib/db";
import { GRN } from "@/types";
import { toast } from "sonner";

export default function AllGRNPage() {
  const [grns, setGrns] = useState<GRN[]>(db.grns);
  const [search, setSearch] = useState("");

  const filtered = grns.filter(
    (g) =>
      g.grnNumber.toLowerCase().includes(search.toLowerCase()) ||
      (g.supplierName || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.invoiceNumber || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Goods Received Notes (GRN)</h1>
          <div className="page-sub">
            Warehouse inward stock receipts, vendor invoices, and delivery inspections
          </div>
        </div>
        <Link href="/grn/create">
          <Button variant="orange" className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Create GRN
          </Button>
        </Link>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">GRN Receipt Ledger</div>
          <div className="text-xs text-text-gray">Total {grns.length} notes</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search GRN number, supplier, invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>GRN Number</th>
              <th>PO Ref</th>
              <th>Supplier</th>
              <th>Vendor Invoice #</th>
              <th>Total Value</th>
              <th>Payment Status</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-patina" /> {g.grnNumber}
                  </div>
                </td>
                <td className="text-xs text-patina font-mono font-bold">
                  {g.poNumber || "Direct Inward"}
                </td>
                <td className="font-semibold text-xs text-text-dark">
                  {g.supplierName}
                </td>
                <td className="text-xs text-text-gray font-mono">
                  {g.invoiceNumber || "-"}
                </td>
                <td className="font-black text-xs text-text-dark">
                  {formatCurrency(g.totalAmount)}
                </td>
                <td>
                  <Badge
                    variant={
                      g.paymentStatus === "PAID"
                        ? "green"
                        : g.paymentStatus === "PARTIAL"
                        ? "orange"
                        : "red"
                    }
                  >
                    {g.paymentStatus}
                  </Badge>
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(g.createdAt)}
                </td>
                <td className="text-right actions-cell">
                  <button
                    className="act-btn"
                    title="View GRN"
                    onClick={() =>
                      toast.info(`GRN: ${g.grnNumber} | Amount: Rs. ${g.totalAmount}`)
                    }
                  >
                    <Eye className="w-4 h-4 text-patina" />
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
