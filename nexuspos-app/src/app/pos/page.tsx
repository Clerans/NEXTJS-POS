"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coffee,
  ShoppingCart,
  Search,
  Sandwich,
  Croissant,
  CupSoda,
  Package,
  Wifi,
  User,
  CreditCard,
  Lock,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Utensils,
  Receipt,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { ReceiptDialog } from "@/components/pos/ReceiptDialog";
import { BaristaKdsModal } from "@/components/pos/BaristaKdsModal";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import {
  Product,
  CartItem,
  PosOrder,
  OrderType,
  PaymentMethod,
  Customer,
  DiningTable,
} from "@/types";
import { toast } from "sonner";

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>(db.products);
  const [customers, setCustomers] = useState<Customer[]>(db.customers);
  const [tables, setTables] = useState<DiningTable[]>(db.tables);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("DINE_IN");
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const [selectedTableId, setSelectedTableId] = useState<number | "">("");
  const [manualDiscount, setManualDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  // Modals
  const [showKds, setShowKds] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [managerPin, setManagerPin] = useState("");
  const [cashTendered, setCashTendered] = useState<string>("");
  const [lastOrder, setLastOrder] = useState<PosOrder | null>(null);

  const categories = [
    "All",
    "Beverages",
    "Bakery",
    "Savory Items",
    "Desserts",
    "Main Course",
  ];

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const groupDiscountRate = selectedCustomer?.discountRate || 0;

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      selectedCategory === "All" || p.categoryName === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch && p.isActive;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.retailPrice,
          qty: 1,
          category: product.categoryName,
        },
      ];
    });
    toast.success(`Added ${product.name} to order`);
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setManualDiscount(0);
    toast.info("Cart cleared");
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const customerDiscountAmount = (subtotal * groupDiscountRate) / 100;
  const totalDiscount = Math.min(subtotal, customerDiscountAmount + Number(manualDiscount || 0));
  const taxableSubtotal = Math.max(0, subtotal - totalDiscount);
  const taxAmount = (taxableSubtotal * 10) / 100;
  const serviceCharge = orderType === "DINE_IN" ? (taxableSubtotal * 10) / 100 : 0;
  const grandTotal = taxableSubtotal + taxAmount + serviceCharge;

  const numericTendered = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, numericTendered - grandTotal);

  // Trigger checkout process
  const startCheckout = () => {
    if (cart.length === 0) {
      toast.error("Please add items to the cart before checking out.");
      return;
    }

    if (paymentMethod === "CREDIT" && !selectedCustomerId) {
      toast.error("Please select an identified customer for credit settlement.");
      return;
    }

    if (paymentMethod === "CREDIT" && selectedCustomer) {
      const prospectiveBalance = selectedCustomer.outstandingBalance + grandTotal;
      if (prospectiveBalance > selectedCustomer.creditLimit) {
        setShowPinModal(true);
        return;
      }
    }

    setCashTendered(String(grandTotal));
    setShowPaymentModal(true);
  };

  const executeOrder = (pinOverride = false) => {
    const selectedTable = tables.find((t) => t.id === selectedTableId);

    const newOrder: PosOrder = {
      id: db.generateOrderId(),
      orderNo: db.generateOrderId(),
      branchId: 1,
      branchName: "NEXUS Main Outlet",
      cashierName: "NEXUS Cashier",
      customerId: selectedCustomerId ? Number(selectedCustomerId) : undefined,
      customerName: selectedCustomer ? selectedCustomer.name : "Walk-in Customer",
      tableId: selectedTableId ? Number(selectedTableId) : undefined,
      tableName: selectedTable ? selectedTable.name : undefined,
      orderType,
      items: cart.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.qty,
        unitPrice: item.price,
        subtotal: item.price * item.qty,
      })),
      subtotal,
      discountAmount: totalDiscount,
      taxAmount,
      serviceCharge,
      totalAmount: grandTotal,
      paymentMethod,
      amountPaid: paymentMethod === "CASH" ? Math.max(grandTotal, numericTendered) : grandTotal,
      changeGiven: paymentMethod === "CASH" ? changeDue : 0,
      status: "COMPLETED",
      kdsStatus: "RECEIVED",
      createdAt: new Date().toISOString(),
    };

    db.orders.unshift(newOrder);

    // Update customer balance if credit
    if (paymentMethod === "CREDIT" && selectedCustomer) {
      selectedCustomer.outstandingBalance += grandTotal;
    }

    setLastOrder(newOrder);
    setCart([]);
    setManualDiscount(0);
    setShowPaymentModal(false);
    setShowPinModal(false);
    setShowReceipt(true);
    toast.success(`Order ${newOrder.orderNo} placed successfully!`);
  };

  const getCategoryIcon = (catName?: string) => {
    switch (catName?.toLowerCase()) {
      case "bakery":
        return <Croissant className="w-8 h-8 text-patina-dark" />;
      case "savory items":
        return <Sandwich className="w-8 h-8 text-patina-dark" />;
      case "beverages":
        return <Coffee className="w-8 h-8 text-patina-dark" />;
      case "desserts":
        return <CupSoda className="w-8 h-8 text-patina-dark" />;
      default:
        return <Package className="w-8 h-8 text-patina-dark" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F6F7] p-4 lg:p-6 space-y-4">
      {/* Top Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-4 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl border border-border hover:bg-patina-light text-text-gray hover:text-patina transition-colors"
            title="Exit to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-text-dark tracking-tight">
                Point of Sale (POS)
              </h1>
              <Badge variant="green" className="flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Online
              </Badge>
            </div>
            <p className="text-[11px] text-text-gray font-medium">
              High-speed cashier register & live order dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={() => setShowKds(true)}
            className="flex items-center gap-1.5 text-xs font-bold"
          >
            <Coffee className="w-4 h-4 text-patina" /> Barista KDS Screen
          </Button>

          <Link
            href="/sales"
            className="btn bg-white border border-border text-text-dark hover:bg-patina-light rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4" /> Sales Ledger
          </Link>
        </div>
      </div>

      {/* Main Grid: Catalog Left (2 cols) & Cart Right (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Chips */}
          <div className="chip-row">
            {categories.map((cat) => (
              <div
                key={cat}
                className={`chip ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-text-gray" />
            <input
              className="input pl-10"
              placeholder="Search products by code, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Product Items Grid */}
          <div className="pos-grid">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="pos-item"
                onClick={() => addToCart(p)}
              >
                <div className="pi-img">{getCategoryIcon(p.categoryName)}</div>
                <div className="font-bold text-xs text-text-dark line-clamp-1">
                  {p.name}
                </div>
                <div className="text-[11px] text-text-gray font-mono">
                  {p.sku}
                </div>
                <div className="text-xs text-patina font-extrabold mt-1">
                  {formatCurrency(p.retailPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Live Order Cart */}
        <div className="bg-white rounded-2xl border border-border p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-patina" />
                <h2 className="font-extrabold text-sm text-text-dark">Current Order</h2>
              </div>
              <button
                onClick={clearCart}
                className="text-xs text-red-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>

            {/* Order Type Selector */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(["DINE_IN", "TAKEAWAY", "DELIVERY"] as OrderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                    orderType === type
                      ? "bg-patina text-white shadow-xs"
                      : "text-text-gray hover:text-text-dark"
                  }`}
                >
                  {type === "DINE_IN"
                    ? "Dine In"
                    : type === "TAKEAWAY"
                    ? "Takeaway"
                    : "Delivery"}
                </button>
              ))}
            </div>

            {/* Dine-in Table Selector */}
            {orderType === "DINE_IN" && (
              <div>
                <label className="block text-[11px] font-bold text-text-gray mb-1">
                  Table Allocation
                </label>
                <select
                  value={selectedTableId}
                  onChange={(e) =>
                    setSelectedTableId(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="select w-full"
                >
                  <option value="">Select Table (Optional)</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} - {t.name} ({t.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer Selector */}
            <div>
              <label className="block text-[11px] font-bold text-text-gray mb-1">
                Customer Account
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) =>
                  setSelectedCustomerId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="select w-full"
              >
                <option value="">Walk-in Customer (No Discount)</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.groupName} - {c.discountRate}% Off)
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Line Items */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="max-w-[130px]">
                      <div className="font-bold text-xs text-text-dark truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-patina font-semibold">
                        {formatCurrency(item.price)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-6 h-6 rounded-md bg-white border border-border flex items-center justify-center text-text-dark hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-6 h-6 rounded-md bg-white border border-border flex items-center justify-center text-text-dark hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="font-black text-xs text-text-dark">
                      {formatCurrency(item.price * item.qty)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-text-gray">
                  No items in order. Click products to add.
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Checkout Summary */}
          <div className="border-t border-border pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-text-gray">
              <span>Subtotal:</span>
              <span className="font-semibold text-text-dark">
                {formatCurrency(subtotal)}
              </span>
            </div>

            {groupDiscountRate > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Group Discount ({groupDiscountRate}%):</span>
                <span>-{formatCurrency(customerDiscountAmount)}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-text-gray">Manual Discount (Rs.):</span>
              <input
                type="number"
                value={manualDiscount || ""}
                onChange={(e) => setManualDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-20 text-right py-1 px-2 border border-border rounded-lg text-xs font-semibold focus:outline-none focus:border-patina"
              />
            </div>

            {orderType === "DINE_IN" && (
              <div className="flex justify-between text-text-gray">
                <span>Service Charge (10%):</span>
                <span>{formatCurrency(serviceCharge)}</span>
              </div>
            )}

            <div className="flex justify-between text-text-gray">
              <span>VAT / Tax (10%):</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>

            <div className="flex justify-between text-base font-black text-text-dark border-t border-border pt-2">
              <span>Total Payable:</span>
              <span className="text-patina">{formatCurrency(grandTotal)}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-text-gray mb-1">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["CASH", "CARD", "CREDIT"] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      paymentMethod === method
                        ? "border-patina bg-patina-light text-patina-dark font-extrabold shadow-xs"
                        : "border-border text-text-gray hover:bg-slate-50"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <Button
              variant="orange"
              onClick={startCheckout}
              disabled={cart.length === 0}
              className="w-full py-3.5 mt-3 text-sm font-black tracking-wide"
            >
              Pay {formatCurrency(grandTotal)}
            </Button>
          </div>
        </div>
      </div>

      {/* Payment Tendered & Finalize Dialog */}
      <Dialog
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Complete Payment Settlement"
        description={`Payment Method: ${paymentMethod}`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-patina-light rounded-xl text-center">
            <span className="text-xs text-patina-dark font-semibold">Total Amount Due</span>
            <div className="text-2xl font-black text-patina mt-0.5">
              {formatCurrency(grandTotal)}
            </div>
          </div>

          {paymentMethod === "CASH" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1">
                  Cash Received (Rs.)
                </label>
                <input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  className="input text-lg font-black text-patina"
                  autoFocus
                />
              </div>

              {/* Quick Cash Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[1000, 2000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    onClick={() => setCashTendered(String(val))}
                    className="py-1.5 bg-slate-100 hover:bg-patina-light text-text-dark text-xs font-bold rounded-lg transition-colors border border-border"
                  >
                    {val}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-border text-xs">
                <span className="font-bold text-text-gray">Change to Return:</span>
                <span className="font-black text-sm text-emerald-700">
                  {formatCurrency(changeDue)}
                </span>
              </div>
            </div>
          )}

          <Button
            variant="orange"
            onClick={() => executeOrder()}
            disabled={paymentMethod === "CASH" && numericTendered < grandTotal}
            className="w-full py-3 text-sm font-bold"
          >
            Confirm & Issue Receipt
          </Button>
        </div>
      </Dialog>

      {/* Manager PIN Override Modal */}
      <Dialog
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        title="Manager Authorization Required"
        description="Customer credit limit exceeded. Manager PIN required to override."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
            Customer outstanding balance will exceed the sanctioned limit of{" "}
            <b>{formatCurrency(selectedCustomer?.creditLimit || 0)}</b>.
          </div>

          <div>
            <label className="block text-xs font-bold text-text-dark mb-1">
              Manager 4-Digit Security PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={managerPin}
              onChange={(e) => setManagerPin(e.target.value)}
              placeholder="••••"
              className="input text-center text-xl tracking-widest font-black"
              autoFocus
            />
          </div>

          <Button
            variant="orange"
            onClick={() => {
              if (managerPin.length < 4) {
                toast.error("Please enter a valid 4-digit manager PIN");
                return;
              }
              executeOrder(true);
            }}
            className="w-full py-3"
          >
            Authorize Credit Sale
          </Button>
        </div>
      </Dialog>

      {/* Barista KDS Modal */}
      <BaristaKdsModal isOpen={showKds} onClose={() => setShowKds(false)} />

      {/* Thermal Receipt Preview Dialog */}
      <ReceiptDialog
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        order={lastOrder}
      />
    </div>
  );
}
