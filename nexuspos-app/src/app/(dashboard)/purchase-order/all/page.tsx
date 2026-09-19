"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, ShoppingCart, Search, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { db } from "@/lib/db";
import { PurchaseOrder } from "@/types";
import { toast } from "sonner";

export default function AllPurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(db.purchaseOrders);
  const [search, setSearch] = useState("");

  const filtered = orders.filter(
    (po) =>
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      (po.supplierName || "").toLowerCase().includes(search.toLowerCase())
  );

  const approvePO = (po: PurchaseOrder) => {
    po.status = "APPROVED";
    setOrders([...db.purchaseOrders]);
    toast.success(`Purchase Order ${po.poNumber} has been approved!`);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Purchase Orders</h1>
          <div className="page-sub">
            Track vendor purchase requisitions, approval lifecycle, and deliveries
          </div>
        </div>
        <Link href="/purchase-order/create">
          <Button variant="orange" className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Create PO
          </Button>
        </Link>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Purchase Order Registry</div>
          <div className="text-xs text-text-gray">Total {orders.length} orders</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search PO number or supplier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>PO Number</th>
              <th>Supplier</th>
              <th>Destination Branch</th>
              <th>Order Total</th>
              <th>Date</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((po) => (
              <tr key={po.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-patina" /> {po.poNumber}
                  </div>
                </td>
                <td className="font-semibold text-xs text-text-dark">
                  {po.supplierName}
                </td>
                <td className="text-xs text-text-gray">{po.branchName}</td>
                <td className="font-black text-xs text-text-dark">
                  {formatCurrency(po.totalAmount)}
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(po.createdAt)}
                </td>
                <td>
                  <Badge
                    variant={
                      po.status === "RECEIVED"
                        ? "green"
                        : po.status === "APPROVED"
                        ? "blue"
                        : "orange"
                    }
                  >
                    {po.status}
                  </Badge>
                </td>
                <td className="text-right actions-cell">
                  {po.status === "PENDING_APPROVAL" && (
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => approvePO(po)}
                      className="text-[11px] py-1 px-2.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approve
                    </Button>
                  )}
                  <button
                    className="act-btn"
                    title="View PO Details"
                    onClick={() =>
                      toast.info(`PO: ${po.poNumber} | Total: Rs. ${po.totalAmount}`)
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
