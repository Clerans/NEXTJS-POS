"use client";

import React, { useState } from "react";
import { Plus, UserCheck, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime } from "@/lib/utils";
import { AttendanceRecord } from "@/types";
import { toast } from "sonner";

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([
    {
      id: 1,
      employeeId: 2,
      employeeName: "Nimali Silva",
      clockIn: "2026-08-03T06:28:00Z",
      clockOut: "2026-08-03T15:05:00Z",
      overtimeHours: 0.5,
      status: "PRESENT",
    },
    {
      id: 2,
      employeeId: 3,
      employeeName: "Rohan Fernando",
      clockIn: "2026-08-03T06:30:00Z",
      clockOut: "2026-08-03T15:00:00Z",
      overtimeHours: 0.0,
      status: "PRESENT",
    },
    {
      id: 3,
      employeeId: 1,
      employeeName: "Kasun Perera",
      clockIn: "2026-08-03T07:45:00Z",
      clockOut: undefined,
      overtimeHours: 0.0,
      status: "PRESENT",
    },
  ]);

  const handleClockIn = () => {
    toast.success("Clock-in recorded via biometric terminal!");
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Staff Attendance &amp; Time Tracking</h1>
          <div className="page-sub">
            Biometric clock-in records, shift punctuality, and overtime calculation
          </div>
        </div>
        <Button variant="orange" onClick={handleClockIn} className="flex items-center gap-1.5">
          <UserCheck className="w-4 h-4" /> Clock In Terminal
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Today&apos;s Attendance Logs</div>
          <div className="text-xs text-text-gray">Total {records.length} clock entries</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Clock In Time</th>
              <th>Clock Out Time</th>
              <th>Overtime Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec) => (
              <tr key={rec.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-patina" /> {rec.employeeName}
                  </div>
                </td>
                <td className="text-xs font-bold text-emerald-700">
                  {formatDateTime(rec.clockIn)}
                </td>
                <td className="text-xs text-text-gray">
                  {rec.clockOut ? formatDateTime(rec.clockOut) : "Active on Duty"}
                </td>
                <td className="font-black text-xs text-patina">
                  {rec.overtimeHours > 0 ? `+${rec.overtimeHours} hrs` : "0.0 hrs"}
                </td>
                <td>
                  <Badge variant="green">{rec.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
