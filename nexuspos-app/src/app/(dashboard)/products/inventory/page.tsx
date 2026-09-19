"use client";

import React, { useState } from "react";
import { Search, AlertTriangle, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { Product } from "@/types";
import { toast } from "sonner";

export default function ProductsInventoryPage() {
  const [products, setProducts] = useState<Product[]>(db.products);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("All");

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjustStock = (product: Product) => {
    const newStockStr = prompt(
      `Adjust stock count for "${product.name}" (Current: ${product.stock ?? 100}):`,
      String(product.stock ?? 100)
    );
    if (newStockStr !== null) {
      const val = parseFloat(newStockStr);
      if (!isNaN(val)) {
        product.stock = val;
        setProducts([...db.products]);
        toast.success(`Updated stock for ${product.name} to ${val}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Products Inventory</h1>
          <div className="page-sub">
            Real-time finished goods stock balances across retail outlets
          </div>
        </div>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Finished Goods Stock Ledger</div>
          <div className="text-xs text-text-gray">Showing {filtered.length} products</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search SKU code or product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="select w-full"
          >
            <option value="All">All Outlets (NEXUS Main, Hyde Park, Kandy)</option>
            <option value="MAIN">NEXUS Main Outlet</option>
            <option value="HYDE">Hyde Park Flagship</option>
            <option value="KANDY">Kandy Express Store</option>
          </select>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>SKU / Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Reorder Alert Level</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const currentStock = p.stock ?? 100;
              const isLow = currentStock <= p.reorderLevel;
              return (
                <tr key={p.id} className="hover:bg-patina-light/50">
                  <td>
                    <div className="font-bold text-xs text-text-dark">{p.name}</div>
                    <div className="text-[10px] text-text-gray font-mono">{p.sku}</div>
                  </td>
                  <td className="text-xs text-text-gray font-medium">{p.categoryName}</td>
                  <td className="font-black text-xs text-text-dark">
                    {currentStock} {p.unitName || "pcs"}
                  </td>
                  <td className="text-xs text-text-gray font-semibold">
                    {p.reorderLevel} {p.unitName || "pcs"}
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
                      onClick={() => handleAdjustStock(p)}
                      className="text-[11px] py-1 px-2.5"
                    >
                      <RefreshCw className="w-3 h-3 text-patina" /> Stock Adjust
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
