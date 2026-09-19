"use client";

import React, { useState } from "react";
import { Plus, Factory, CheckCircle2, Search, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { WarehouseProduction } from "@/types";
import { toast } from "sonner";

export default function WarehouseProductionsPage() {
  const [productions, setProductions] = useState<WarehouseProduction[]>([
    {
      id: 1,
      productionNo: "PROD-202608-001",
      warehouseId: 1,
      warehouseName: "Central Bakery Production Unit",
      recipeId: 1,
      recipeName: "Artisan Butter Croissant Formula",
      productId: 5,
      productName: "Artisan Butter Croissant",
      quantityToProduce: 150,
      status: "COMPLETED",
      totalCost: 28500,
      producedAt: "2026-08-03",
    },
    {
      id: 2,
      productionNo: "PROD-202608-002",
      warehouseId: 1,
      warehouseName: "Central Bakery Production Unit",
      recipeId: 2,
      recipeName: "New York Cheesecake Formula",
      productId: 9,
      productName: "New York Cheesecake Slice",
      quantityToProduce: 60,
      status: "IN_PROGRESS",
      totalCost: 22800,
      producedAt: "2026-08-03",
    },
  ]);

  const completeProduction = (p: WarehouseProduction) => {
    p.status = "COMPLETED";
    setProductions([...productions]);
    toast.success(`Production Run ${p.productionNo} completed! Output stock credited.`);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Warehouse Production Runs</h1>
          <div className="page-sub">
            Central commissary batch baking, ingredient deduction, and finished goods creation
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening Production Batch Run Modal...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Start Production Run
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Production Work Orders</div>
          <div className="text-xs text-text-gray">Total {productions.length} batches</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Work Order #</th>
              <th>Production Unit</th>
              <th>Finished Product</th>
              <th>Batch Size</th>
              <th>Total Batch Cost</th>
              <th>Production Date</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {productions.map((p) => (
              <tr key={p.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark font-mono flex items-center gap-1.5">
                    <Factory className="w-4 h-4 text-patina" /> {p.productionNo}
                  </div>
                </td>
                <td className="text-xs text-text-gray">{p.warehouseName}</td>
                <td className="font-bold text-xs text-text-dark">{p.productName}</td>
                <td className="font-black text-xs text-patina">
                  {p.quantityToProduce} units
                </td>
                <td className="font-bold text-xs text-text-dark">
                  {formatCurrency(p.totalCost ?? 0)}
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(p.producedAt)}
                </td>
                <td>
                  <Badge variant={p.status === "COMPLETED" ? "green" : "orange"}>
                    {p.status}
                  </Badge>
                </td>
                <td className="text-right actions-cell">
                  {p.status === "IN_PROGRESS" && (
                    <Button
                      size="sm"
                      variant="orange"
                      onClick={() => completeProduction(p)}
                      className="text-[11px] py-1 px-2.5"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Finish Batch
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
