"use client";

import React, { useState } from "react";
import { AlertTriangle, Plus, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/lib/db";
import { toast } from "sonner";

export default function StockAlertsPage() {
  const [filterType, setFilterType] = useState("All");

  const alerts = [
    {
      id: 1,
      name: "Belgian Dark Chocolate Callets 70%",
      type: "Raw Material",
      stock: 4.2,
      reorder: 8.0,
      unit: "kg",
      urgency: "HIGH",
      suggestedPO: 20,
    },
    {
      id: 2,
      name: "Monin Caramel Flavored Syrup",
      type: "Raw Material",
      stock: 2.0,
      reorder: 5.0,
      unit: "L",
      urgency: "CRITICAL",
      suggestedPO: 10,
    },
    {
      id: 3,
      name: "Grilled Smoked Chicken Sandwich",
      type: "Product",
      stock: 3,
      reorder: 8,
      unit: "pcs",
      urgency: "MEDIUM",
      suggestedPO: 15,
    },
    {
      id: 4,
      name: "New York Cheesecake Slice",
      type: "Product",
      stock: 2,
      reorder: 6,
      unit: "pcs",
      urgency: "HIGH",
      suggestedPO: 12,
    },
  ];

  const filteredAlerts = alerts.filter(
    (a) => filterType === "All" || a.type === filterType
  );

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Stock Reorder Alerts</h1>
          <div className="page-sub">
            Real-time threshold surveillance for finished goods &amp; raw ingredients
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Critical Stock Items
          </div>
          <div className="text-xs text-text-gray">
            {filteredAlerts.length} items require reordering
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Item Details</th>
              <th>Category Type</th>
              <th>Current Balance</th>
              <th>Alert Level</th>
              <th>Urgency</th>
              <th>Suggested Order</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.map((item) => (
              <tr key={item.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark">{item.name}</div>
                </td>
                <td>
                  <Badge variant={item.type === "Product" ? "blue" : "orange"}>
                    {item.type}
                  </Badge>
                </td>
                <td className="font-black text-xs text-red-600">
                  {item.stock} {item.unit}
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {item.reorder} {item.unit}
                </td>
                <td>
                  <Badge
                    variant={
                      item.urgency === "CRITICAL"
                        ? "red"
                        : item.urgency === "HIGH"
                        ? "orange"
                        : "gray"
                    }
                  >
                    {item.urgency}
                  </Badge>
                </td>
                <td className="text-xs font-bold text-patina">
                  +{item.suggestedPO} {item.unit}
                </td>
                <td className="text-right actions-cell">
                  <Button
                    size="sm"
                    variant="orange"
                    onClick={() =>
                      toast.success(`Generated automated Purchase Order for ${item.name}`)
                    }
                    className="text-[11px] py-1 px-2.5 flex items-center gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" /> Quick PO
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
