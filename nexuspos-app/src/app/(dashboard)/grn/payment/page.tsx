"use client";

import React, { useState } from "react";
import { Plus, CreditCard, Search, DollarSign, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { db } from "@/lib/db";
import { GRNPayment } from "@/types";
import { toast } from "sonner";

export default function GRNPaymentPage() {
  const [grns] = useState(db.grns);
  const [payments, setPayments] = useState<GRNPayment[]>([
    {
      id: 1,
      grnId: 1,
      grnNumber: "GRN-2026-0045",
      supplierName: "Kotmale Dairies PLC",
      amount: 96000,
      paymentMethod: "BANK_TRANSFER",
      referenceNumber: "TXN-BOC-88910",
      paymentDate: "2026-08-02",
      notes: "Settled against Invoice INV-KOT-9981",
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedGrnId, setSelectedGrnId] = useState<number>(grns[0]?.id || 1);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "BANK_TRANSFER" | "CHEQUE">("BANK_TRANSFER");
  const [referenceNumber, setReferenceNumber] = useState("");

  const handleOpenAdd = () => {
    const defaultGrn = grns[0];
    setSelectedGrnId(defaultGrn?.id || 1);
    setAmount(String(defaultGrn?.totalAmount || 50000));
    setReferenceNumber("");
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selGRN = grns.find((g) => g.id === Number(selectedGrnId));
    const paidVal = parseFloat(amount) || 0;

    const newPayment: GRNPayment = {
      id: payments.length + 1,
      grnId: Number(selectedGrnId),
      grnNumber: selGRN?.grnNumber,
      supplierName: selGRN?.supplierName,
      amount: paidVal,
      paymentMethod,
      referenceNumber,
      paymentDate: new Date().toISOString().slice(0, 10),
    };

    if (selGRN) {
      selGRN.paidAmount += paidVal;
      selGRN.paymentStatus =
        selGRN.paidAmount >= selGRN.totalAmount ? "PAID" : "PARTIAL";
    }

    setPayments([newPayment, ...payments]);
    toast.success(`Payment voucher recorded for ${selGRN?.grnNumber}!`);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">GRN Supplier Payments</h1>
          <div className="page-sub">
            Settle vendor procurement invoices, bank transfers, and payment vouchers
          </div>
        </div>
        <Button variant="orange" onClick={handleOpenAdd} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Record Payment
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Payment Settlement History</div>
          <div className="text-xs text-text-gray">Total {payments.length} vouchers</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Voucher / GRN</th>
              <th>Supplier Name</th>
              <th>Settled Amount</th>
              <th>Payment Method</th>
              <th>Bank Ref #</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-patina" /> {p.grnNumber}
                  </div>
                  <div className="text-[10px] text-text-gray font-mono">
                    VOUCHER-#{String(p.id).padStart(4, "0")}
                  </div>
                </td>
                <td className="font-semibold text-xs text-text-dark">
                  {p.supplierName}
                </td>
                <td className="font-black text-xs text-patina">
                  {formatCurrency(p.amount)}
                </td>
                <td>
                  <Badge variant="blue">{p.paymentMethod.replace("_", " ")}</Badge>
                </td>
                <td className="text-xs text-text-gray font-mono">
                  {p.referenceNumber || "-"}
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(p.paymentDate)}
                </td>
                <td>
                  <Badge variant="green">Settled</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record Payment Dialog */}
      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Record Supplier Payment"
        description="Settle pending invoice balance for goods received"
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Select
            label="Select GRN Invoice"
            value={selectedGrnId}
            onChange={(e) => setSelectedGrnId(Number(e.target.value))}
            required
          >
            {grns.map((g) => (
              <option key={g.id} value={g.id}>
                {g.grnNumber} - {g.supplierName} ({formatCurrency(g.totalAmount)})
              </option>
            ))}
          </Select>

          <Input
            label="Payment Amount (Rs.)"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            required
          >
            <option value="BANK_TRANSFER">Bank Transfer / Online</option>
            <option value="CHEQUE">Company Cheque</option>
            <option value="CASH">Petty Cash</option>
          </Select>

          <Input
            label="Bank Reference / Cheque Number"
            placeholder="e.g. TXN-BOC-88910"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              Confirm Settlement
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
