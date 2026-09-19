"use client";

import React, { useState } from "react";
import { Search, RefreshCw, Wheat } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { RawMaterial } from "@/types";
import { toast } from "sonner";

export default function RawMaterialInventoryPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>(db.rawMaterials);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("All");

  const filtered = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjust = (mat: RawMaterial) => {
    const valStr = prompt(
      `Adjust stock quantity for ${mat.name} (${mat.unitName}):`,
      String(mat.currentStock ?? 0)
    );
    if (valStr !== null) {
      const val = parseFloat(valStr);
      if (!isNaN(val)) {
        mat.currentStock = val;
        setMaterials([...db.rawMaterials]);
        toast.success(`Updated ${mat.name} stock to ${val} ${mat.unitName}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Raw Material Inventory</h1>
          <div className="page-sub">
            Warehouse bulk ingredient storage and inventory balances
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Bulk Material Ledger</div>
          <div className="text-xs text-text-gray">Showing {filtered.length} materials</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search raw material name, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="select w-full"
          >
            <option value="All">All Warehouses (Main Storage, Cold Storage)</option>
            <option value="WH-01">Central Main Warehouse</option>
            <option value="WH-02">Chilled Cold Storage</option>
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Material Details</th>
              <th>Unit</th>
              <th>Current Stock</th>
              <th>Threshold</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((mat) => {
              const stock = mat.currentStock ?? 0;
              const isLow = stock <= mat.reorderLevel;
              return (
                <tr key={mat.id} className="hover:bg-patina-light/50">
                  <td>
                    <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                      <Wheat className="w-4 h-4 text-patina" /> {mat.name}
                    </div>
                    <div className="text-[10px] text-text-gray font-mono">{mat.code}</div>
                  </td>
                  <td className="text-xs font-bold text-patina">{mat.unitName}</td>
                  <td className="font-black text-xs text-text-dark">
                    {stock} {mat.unitName}
                  </td>
                  <td className="text-xs text-text-gray font-medium">
                    {mat.reorderLevel} {mat.unitName}
                  </td>
                  <td>
                    <Badge variant={isLow ? "red" : "green"}>
                      {isLow ? "Low Stock" : "Sufficient"}
                    </Badge>
                  </td>
                  <td className="text-right actions-cell">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleAdjust(mat)}
                      className="text-[11px] py-1 px-2.5"
                    >
                      <RefreshCw className="w-3 h-3 text-patina" /> Adjust Stock
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
