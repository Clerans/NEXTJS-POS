"use client";

import React, { useState } from "react";
import { Plus, ArrowRightLeft, Search, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { StockTransfer } from "@/types";
import { toast } from "sonner";

export default function WarehouseTransferPage() {
  const [transfers, setTransfers] = useState<StockTransfer[]>([
    {
      id: 1,
      transferNo: "TRF-2026-0034",
      sourceWarehouseId: 1,
      sourceWarehouseName: "Central Main Warehouse",
      destinationWarehouseId: 2,
      destinationWarehouseName: "Hyde Park Store Storage",
      status: "IN_TRANSIT",
      itemCount: 4,
      createdAt: "2026-08-03",
    },
    {
      id: 2,
      transferNo: "TRF-2026-0033",
      sourceWarehouseId: 1,
      sourceWarehouseName: "Central Main Warehouse",
      destinationWarehouseId: 3,
      destinationWarehouseName: "Kandy Express Store",
      status: "RECEIVED",
      itemCount: 6,
      createdAt: "2026-08-02",
    },
  ]);

  const receiveTransfer = (t: StockTransfer) => {
    t.status = "RECEIVED";
    setTransfers([...transfers]);
    toast.success(`Stock Transfer ${t.transferNo} confirmed as RECEIVED!`);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Stock Transfers</h1>
          <div className="page-sub">
            Inter-warehouse stock transfer requisitions, dispatches, and delivery confirmations
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening Stock Transfer Request Dialog...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Stock Transfer
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Transfer Orders</div>
          <div className="text-xs text-text-gray">Total {transfers.length} orders</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Transfer Number</th>
              <th>Source Location</th>
              <th>Destination Location</th>
              <th>Items Included</th>
              <th>Transfer Date</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark font-mono flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4 text-patina" /> {t.transferNo}
                  </div>
                </td>
                <td className="text-xs font-semibold text-text-dark">
                  {t.sourceWarehouseName}
                </td>
                <td className="text-xs font-semibold text-patina">
                  {t.destinationWarehouseName}
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {t.itemCount} distinct items
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(t.createdAt)}
                </td>
                <td>
                  <Badge variant={t.status === "RECEIVED" ? "green" : "orange"}>
                    {t.status}
                  </Badge>
                </td>
                <td className="text-right actions-cell">
                  {t.status === "IN_TRANSIT" && (
                    <Button
                      size="sm"
                      variant="orange"
                      onClick={() => receiveTransfer(t)}
                      className="text-[11px] py-1 px-2.5"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Receive Inward
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
