"use client";

import React, { useState } from "react";
import { Plus, Utensils, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/lib/db";
import { DiningTable } from "@/types";
import { toast } from "sonner";

export default function TablesPage() {
  const [tables, setTables] = useState<DiningTable[]>(db.tables);

  const toggleTable = (table: DiningTable) => {
    const nextStatus: DiningTable["status"] =
      table.status === "AVAILABLE"
        ? "OCCUPIED"
        : table.status === "OCCUPIED"
        ? "CLEANING"
        : "AVAILABLE";
    table.status = nextStatus;
    setTables([...db.tables]);
    toast.success(`${table.name} status updated to ${nextStatus}`);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Restaurant Floor Tables</h1>
          <div className="page-sub">
            Real-time dine-in seating layout, occupancy status, and table turn tracking
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening Add Table Floor Plan Dialog...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Table
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {tables.map((table) => {
          const isAvailable = table.status === "AVAILABLE";
          const isOccupied = table.status === "OCCUPIED";
          const isReserved = table.status === "RESERVED";

          return (
            <div
              key={table.id}
              onClick={() => toggleTable(table)}
              className={`card bg-white p-4 rounded-2xl border text-center cursor-pointer transition-all hover:scale-[1.02] flex flex-col items-center justify-between space-y-3 ${
                isAvailable
                  ? "border-emerald-300 bg-emerald-50/20"
                  : isOccupied
                  ? "border-amber-300 bg-amber-50/20"
                  : "border-border"
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-text-dark font-extrabold text-sm">
                {table.tableNumber}
              </div>

              <div>
                <div className="font-bold text-xs text-text-dark">{table.name}</div>
                <div className="text-[11px] text-text-gray font-medium flex items-center justify-center gap-1 mt-0.5">
                  <Users className="w-3 h-3 text-patina" /> {table.capacity} Seats
                </div>
              </div>

              <Badge
                variant={
                  isAvailable ? "green" : isOccupied ? "red" : isReserved ? "purple" : "gray"
                }
              >
                {table.status}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
