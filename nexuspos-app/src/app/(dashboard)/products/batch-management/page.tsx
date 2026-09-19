"use client";

import React, { useState } from "react";
import { Plus, Boxes, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function BatchManagementPage() {
  const [batches, setBatches] = useState([
    {
      id: 1,
      batchNumber: "BATCH-CFB-202608",
      itemName: "Premium Arabica Coffee Beans",
      warehouse: "Central Main Warehouse",
      quantity: 45.5,
      unit: "kg",
      unitCost: 6500,
      expiryDate: "2027-02-15",
      status: "ACTIVE",
    },
    {
      id: 2,
      batchNumber: "BATCH-MLK-0802",
      itemName: "Fresh Full-Cream Dairy Milk",
      warehouse: "Chilled Cold Storage",
      quantity: 120.0,
      unit: "L",
      unitCost: 480,
      expiryDate: "2026-08-12",
      status: "ACTIVE",
    },
    {
      id: 3,
      batchNumber: "BATCH-FLR-202607",
      itemName: "Artisan T55 Wheat Pastry Flour",
      warehouse: "Central Main Warehouse",
      quantity: 250.0,
      unit: "kg",
      unitCost: 380,
      expiryDate: "2026-12-31",
      status: "ACTIVE",
    },
  ]);

  const [search, setSearch] = useState("");

  const filtered = batches.filter(
    (b) =>
      b.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.itemName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Batch Inventory Management</h1>
          <div className="page-sub">
            Track lot numbers, unit costs, manufacturing origins, and shelf-life expiries
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening New Batch Lot Dialog...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Register New Batch
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Active Batch Lots</div>
          <div className="text-xs text-text-gray">Total {batches.length} active lots</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search batch number or item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Batch Number</th>
              <th>Item / Ingredient</th>
              <th>Warehouse</th>
              <th>Quantity Remaining</th>
              <th>Unit Cost</th>
              <th>Expiry Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark font-mono flex items-center gap-1.5">
                    <Boxes className="w-3.5 h-3.5 text-patina" /> {b.batchNumber}
                  </div>
                </td>
                <td className="font-semibold text-xs text-text-dark">{b.itemName}</td>
                <td className="text-xs text-text-gray">{b.warehouse}</td>
                <td className="font-black text-xs text-patina">
                  {b.quantity} {b.unit}
                </td>
                <td className="text-xs font-bold text-text-dark">
                  {formatCurrency(b.unitCost)}
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(b.expiryDate)}
                </td>
                <td>
                  <Badge variant="green">{b.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
