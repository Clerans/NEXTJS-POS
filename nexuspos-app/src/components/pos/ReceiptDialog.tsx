"use client";

import React, { useRef } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Printer, CheckCircle } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { PosOrder } from "@/types";

interface ReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: PosOrder | null;
}

export const ReceiptDialog: React.FC<ReceiptDialogProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Receipt"
      description="Thermal order receipt preview"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {/* Receipt Container */}
        <div
          ref={receiptRef}
          className="bg-white border border-border p-6 rounded-xl text-center text-text-dark font-mono text-xs shadow-inner space-y-3"
        >
          {/* Header */}
          <div className="border-b border-dashed border-border pb-3">
            <h2 className="font-extrabold text-base tracking-tight font-sans text-patina">
              NEXUSPOS
            </h2>
            <p className="text-[11px] text-text-gray font-sans">
              Artisan Cafe & Restaurant
            </p>
            <p className="text-[10px] text-text-gray mt-1">
              42 Galle Road, Colombo 03
            </p>
            <p className="text-[10px] text-text-gray">Tel: +94 11 200 0001</p>
          </div>

          {/* Meta */}
          <div className="text-left text-[11px] space-y-1 border-b border-dashed border-border pb-2">
            <div className="flex justify-between">
              <span className="text-text-gray">Order No:</span>
              <span className="font-bold">{order.orderNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-gray">Date/Time:</span>
              <span>{formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-gray">Cashier:</span>
              <span>{order.cashierName || "Main Counter"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-gray">Type / Table:</span>
              <span className="font-bold">{order.orderType} {order.tableName ? `(${order.tableName})` : ""}</span>
            </div>
            {order.customerName && (
              <div className="flex justify-between">
                <span className="text-text-gray">Customer:</span>
                <span>{order.customerName}</span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-border text-[10px] text-text-gray">
                <th className="py-1">Item</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1 font-medium">{item.productName}</td>
                  <td className="py-1 text-center font-bold">{item.quantity}</td>
                  <td className="py-1 text-right">{item.unitPrice.toFixed(2)}</td>
                  <td className="py-1 text-right font-bold">{item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculations */}
          <div className="text-right text-[11px] space-y-1 border-t border-dashed border-border pt-2">
            <div className="flex justify-between">
              <span className="text-text-gray">Subtotal:</span>
              <span>{order.subtotal.toFixed(2)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount:</span>
                <span>-{order.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {order.serviceCharge > 0 && (
              <div className="flex justify-between">
                <span className="text-text-gray">Service Charge (10%):</span>
                <span>{order.serviceCharge.toFixed(2)}</span>
              </div>
            )}
            {order.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-text-gray">VAT / Tax:</span>
                <span>{order.taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-text-dark border-t border-border pt-1">
              <span>TOTAL (LKR):</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-text-gray pt-1">
              <span>Paid via {order.paymentMethod}:</span>
              <span>{order.amountPaid.toFixed(2)}</span>
            </div>
            {order.changeGiven > 0 && (
              <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                <span>Change Returned:</span>
                <span>{order.changeGiven.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="border-t border-dashed border-border pt-3 text-[10px] text-text-gray space-y-0.5">
            <p className="font-bold">Thank you for dining with NEXUSPOS!</p>
            <p>Free WiFi: NEXUS-Guest / Pass: coffee2026</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button variant="default" onClick={onClose}>
            Close
          </Button>
          <Button variant="orange" onClick={handlePrint} className="flex items-center gap-1.5">
            <Printer className="w-4 h-4" /> Print Thermal Slip
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
