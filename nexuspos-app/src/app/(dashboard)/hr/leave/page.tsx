"use client";

import React, { useState } from "react";
import { Plus, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { LeaveRequest } from "@/types";
import { toast } from "sonner";

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([
    {
      id: 1,
      employeeId: 3,
      employeeName: "Rohan Fernando",
      leaveType: "ANNUAL",
      startDate: "2026-08-10",
      endDate: "2026-08-12",
      days: 3,
      reason: "Family event in Kandy",
      status: "PENDING",
    },
    {
      id: 2,
      employeeId: 2,
      employeeName: "Nimali Silva",
      leaveType: "CASUAL",
      startDate: "2026-07-28",
      endDate: "2026-07-28",
      days: 1,
      reason: "Personal appointment",
      status: "APPROVED",
    },
  ]);

  const approveLeave = (leave: LeaveRequest) => {
    leave.status = "APPROVED";
    setLeaves([...leaves]);
    toast.success(`Leave request for ${leave.employeeName} approved!`);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Leave Management</h1>
          <div className="page-sub">
            Staff leave requests, entitlement balance tracking, and approval workflows
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening New Leave Application Dialog...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Apply Leave
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Leave Applications</div>
          <div className="text-xs text-text-gray">Total {leaves.length} requests</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Leave Type</th>
              <th>Date Range</th>
              <th>Total Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((l) => (
              <tr key={l.id} className="hover:bg-patina-light/50">
                <td className="font-bold text-xs text-text-dark">
                  {l.employeeName}
                </td>
                <td>
                  <Badge variant="blue">{l.leaveType}</Badge>
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(l.startDate)} to {formatDate(l.endDate)}
                </td>
                <td className="font-bold text-xs text-patina">{l.days} Day(s)</td>
                <td className="text-xs text-text-gray">{l.reason || "-"}</td>
                <td>
                  <Badge
                    variant={
                      l.status === "APPROVED"
                        ? "green"
                        : l.status === "PENDING"
                        ? "orange"
                        : "red"
                    }
                  >
                    {l.status}
                  </Badge>
                </td>
                <td className="text-right actions-cell">
                  {l.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="orange"
                      onClick={() => approveLeave(l)}
                      className="text-[11px] py-1 px-2.5"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Approve
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
