"use client";

import React, { useState } from "react";
import {
  Search,
  Receipt,
  RotateCcw,
  Eye,
  Filter,
  Ban,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { ReceiptDialog } from "@/components/pos/ReceiptDialog";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { db } from "@/lib/db";
import { PosOrder } from "@/types";
import { toast } from "sonner";

export default function SalesPage() {
  const [orders, setOrders] = useState<PosOrder[]>(db.orders);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState<PosOrder | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Void modal state
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [orderToVoid, setOrderToVoid] = useState<PosOrder | null>(null);
  const [voidReason, setVoidReason] = useState("");

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName || "").toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "All" || o.orderType === typeFilter;
    const matchPayment =
      paymentFilter === "All" || o.paymentMethod === paymentFilter;
    const matchStatus = statusFilter === "All" || o.status === statusFilter;
    return matchSearch && matchType && matchPayment && matchStatus;
  });

  const totalRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((acc, o) => acc + o.totalAmount, 0);
  const totalDiscounts = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((acc, o) => acc + o.discountAmount, 0);

  const handleVoidOrder = () => {
    if (!orderToVoid) return;
    if (!voidReason.trim()) {
      toast.error("Please provide a reason for voiding this order.");
      return;
    }

    orderToVoid.status = "VOIDED";
    orderToVoid.voidReason = voidReason;
    setOrders([...db.orders]);
    setShowVoidModal(false);
    setVoidReason("");
    setOrderToVoid(null);
    toast.info(`Order ${orderToVoid.orderNo} has been marked as VOIDED.`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Sales & Orders Ledger</h1>
          <div className="page-sub">
            Transaction history, receipt reprints, and register settlements
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={() => toast.info("Exporting sales ledger to CSV...")}
            className="flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-patina" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-white p-4 rounded-xl border border-border">
          <div className="text-xs font-semibold text-text-gray mb-1">
            Total Settled Sales
          </div>
          <div className="text-xl font-black text-text-dark">
            {formatCurrency(totalRevenue)}
          </div>
        </div>

        <div className="card bg-white p-4 rounded-xl border border-border">
          <div className="text-xs font-semibold text-text-gray mb-1">
            Total Orders Count
          </div>
          <div className="text-xl font-black text-text-dark">
            {orders.length}
          </div>
        </div>

        <div className="card bg-white p-4 rounded-xl border border-border">
          <div className="text-xs font-semibold text-text-gray mb-1">
            Discounts Granted
          </div>
          <div className="text-xl font-black text-emerald-600">
            {formatCurrency(totalDiscounts)}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Order Transactions</div>
          <div className="text-xs text-text-gray">
            Showing {filteredOrders.length} of {orders.length} transactions
          </div>
        </div>

        {/* Filters */}
        <div className="filters-grid four">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search order no, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select w-full"
          >
            <option value="All">All Order Types</option>
            <option value="DINE_IN">Dine In</option>
            <option value="TAKEAWAY">Takeaway</option>
            <option value="DELIVERY">Delivery</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="select w-full"
          >
            <option value="All">All Payments</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="CREDIT">Credit</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select w-full"
          >
            <option value="All">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="VOIDED">Voided</option>
          </select>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr>
              <th>Order Details</th>
              <th>Date / Time</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-patina-light/50">
                  <td>
                    <div className="font-bold text-xs text-text-dark">
                      {order.orderNo}
                    </div>
                    <div className="text-[10px] text-text-gray">
                      {order.branchName}
                    </div>
                  </td>
                  <td className="text-xs text-text-gray font-medium">
                    {formatDateTime(order.createdAt)}
                  </td>
                  <td>
                    <div className="font-semibold text-xs text-text-dark">
                      {order.customerName || "Walk-in"}
                    </div>
                    {order.tableName && (
                      <div className="text-[10px] text-patina font-semibold">
                        Table: {order.tableName}
                      </div>
                    )}
                  </td>
                  <td>
                    <Badge variant="orange">{order.orderType}</Badge>
                  </td>
                  <td className="text-xs text-text-gray font-medium">
                    {order.items.length} items
                  </td>
                  <td>
                    <Badge
                      variant={
                        order.paymentMethod === "CARD"
                          ? "blue"
                          : order.paymentMethod === "CREDIT"
                          ? "purple"
                          : "green"
                      }
                    >
                      {order.paymentMethod}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      variant={
                        order.status === "COMPLETED" ? "green" : "red"
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="font-bold text-xs text-text-dark">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="text-right actions-cell">
                    <button
                      className="act-btn"
                      title="View & Print Slip"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowReceiptModal(true);
                      }}
                    >
                      <Receipt className="w-4 h-4 text-patina" />
                    </button>
                    {order.status === "COMPLETED" && (
                      <button
                        className="act-btn act-delete"
                        title="Void Order"
                        onClick={() => {
                          setOrderToVoid(order);
                          setShowVoidModal(true);
                        }}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-8 text-xs text-text-gray">
                  No sales matching the filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Dialog */}
      <ReceiptDialog
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        order={selectedOrder}
      />

      {/* Void Order Dialog */}
      <Dialog
        isOpen={showVoidModal}
        onClose={() => setShowVoidModal(false)}
        title="Void Sales Transaction"
        description={`Are you sure you want to void order ${orderToVoid?.orderNo}?`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
            Warning: Voiding an order reverses the settled amount and flags the
            transaction for manager audit.
          </div>

          <div>
            <label className="block text-xs font-bold text-text-dark mb-1">
              Reason for Voiding <span className="text-red-500">*</span>
            </label>
            <textarea
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="e.g. Customer cancelled order / accidental punch"
              className="textarea w-full text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="default" onClick={() => setShowVoidModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleVoidOrder}
              disabled={!voidReason.trim()}
            >
              Confirm Void
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
