"use client";

import React, { useState } from "react";
import { Plus, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { db } from "@/lib/db";
import { EmployeeShift } from "@/types";
import { toast } from "sonner";

export default function EmployeeShiftsPage() {
  const [roster, setRoster] = useState<EmployeeShift[]>([
    {
      id: 1,
      employeeId: 2,
      employeeName: "Nimali Silva",
      shiftId: 1,
      shiftName: "Morning Opening Shift (06:30 - 15:00)",
      shiftDate: "2026-08-03",
      status: "COMPLETED",
    },
    {
      id: 2,
      employeeId: 3,
      employeeName: "Rohan Fernando",
      shiftId: 1,
      shiftName: "Morning Opening Shift (06:30 - 15:00)",
      shiftDate: "2026-08-03",
      status: "COMPLETED",
    },
    {
      id: 3,
      employeeId: 4,
      employeeName: "Dilani Bandara",
      shiftId: 2,
      shiftName: "Afternoon / Evening Shift (14:30 - 23:00)",
      shiftDate: "2026-08-03",
      status: "SCHEDULED",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Employee Shift Roster</h1>
          <div className="page-sub">
            Staff weekly schedule allocation and roster assignments
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening Shift Assignment Modal...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Assign Shift
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Weekly Roster Entries</div>
          <div className="text-xs text-text-gray">Total {roster.length} scheduled duties</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Assigned Shift</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((r) => (
              <tr key={r.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <User className="w-4 h-4 text-patina" /> {r.employeeName}
                  </div>
                </td>
                <td className="text-xs font-semibold text-text-dark">
                  {r.shiftName}
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(r.shiftDate)}
                </td>
                <td>
                  <Badge variant={r.status === "COMPLETED" ? "green" : "orange"}>
                    {r.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
