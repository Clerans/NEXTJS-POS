"use client";

import React, { useState } from "react";
import { Plus, Car, CheckCircle2, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransportClaim } from "@/types";
import { toast } from "sonner";

export default function TransportClaimsPage() {
  const [claims, setClaims] = useState<TransportClaim[]>([
    {
      id: 1,
      employeeId: 1,
      employeeName: "Kasun Perera",
      claimDate: "2026-08-01",
      distanceKm: 42.5,
      amount: 8500,
      purpose: "Vendor site visit & procurement contract signing",
      status: "APPROVED",
    },
    {
      id: 2,
      employeeId: 2,
      employeeName: "Nimali Silva",
      claimDate: "2026-08-02",
      distanceKm: 12.0,
      amount: 2500,
      purpose: "Emergency late evening closing transport",
      status: "APPROVED",
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Transport Claims</h1>
          <div className="page-sub">
            Staff travel reimbursements, client delivery mileage, and claim settlements
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening New Transport Claim Application...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Submit Claim
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Reimbursement Requests</div>
          <div className="text-xs text-text-gray">Total {claims.length} claims</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Claim Date</th>
              <th>Distance (km)</th>
              <th>Claim Purpose</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((c) => (
              <tr key={c.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <Car className="w-4 h-4 text-patina" /> {c.employeeName}
                  </div>
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(c.claimDate)}
                </td>
                <td className="text-xs font-semibold text-text-dark">
                  {c.distanceKm} km
                </td>
                <td className="text-xs text-text-gray max-w-sm">{c.purpose}</td>
                <td className="font-black text-xs text-patina">
                  {formatCurrency(c.amount)}
                </td>
                <td>
                  <Badge variant="green">{c.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
