"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { PurchaseOrder, PurchaseOrderItem } from "@/types";
import { toast } from "sonner";

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [suppliers] = useState(db.suppliers);
  const [branches] = useState(db.branches);
  const [rawMaterials] = useState(db.rawMaterials);

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || 1);
  const [branchId, setBranchId] = useState(branches[0]?.id || 1);

  const [items, setItems] = useState<PurchaseOrderItem[]>([
    {
      rawMaterialId: rawMaterials[0]?.id || 1,
      rawMaterialName: rawMaterials[0]?.name,
      quantity: 50,
      unitCost: rawMaterials[0]?.costPerUnit || 1000,
      totalCost: 50 * (rawMaterials[0]?.costPerUnit || 1000),
    },
  ]);

  const addItem = () => {
    const defaultMat = rawMaterials[0];
    setItems([
      ...items,
      {
        rawMaterialId: defaultMat?.id || 1,
        rawMaterialName: defaultMat?.name,
        quantity: 10,
        unitCost: defaultMat?.costPerUnit || 1000,
        totalCost: 10 * (defaultMat?.costPerUnit || 1000),
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof PurchaseOrderItem,
    value: any
  ) => {
    const updated = [...items];
    const target = updated[index];

    if (field === "rawMaterialId") {
      const mat = rawMaterials.find((m) => m.id === Number(value));
      target.rawMaterialId = Number(value);
      target.rawMaterialName = mat?.name;
      target.unitCost = mat?.costPerUnit || 0;
      target.totalCost = target.quantity * target.unitCost;
    } else if (field === "quantity" || field === "unitCost") {
      target[field] = Number(value) || 0;
      target.totalCost = target.quantity * target.unitCost;
    }

    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((acc, it) => acc + it.totalCost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selSup = suppliers.find((s) => s.id === Number(supplierId));
    const selBranch = branches.find((b) => b.id === Number(branchId));

    const poNumber = `PO-${new Date().getFullYear()}-${String(
      db.purchaseOrders.length + 101
    ).padStart(4, "0")}`;

    const newPO: PurchaseOrder = {
      id: db.purchaseOrders.length + 1,
      poNumber,
      supplierId: Number(supplierId),
      supplierName: selSup?.name,
      branchId: Number(branchId),
      branchName: selBranch?.name,
      totalAmount,
      status: "APPROVED",
      items,
      createdAt: new Date().toISOString(),
    };

    db.purchaseOrders.unshift(newPO);
    toast.success(`Purchase Order ${poNumber} generated successfully!`);
    router.push("/purchase-order/all");
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl border border-border hover:bg-patina-light text-text-gray hover:text-patina transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="page-title">Create Purchase Order</h1>
          <div className="page-sub">
            Prepare vendor procurement order with item line costs
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header Form Card */}
        <div className="card space-y-4">
          <div className="panel-title">Order Information</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Select Supplier"
              value={supplierId}
              onChange={(e) => setSupplierId(Number(e.target.value))}
              required
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.paymentTerms})
                </option>
              ))}
            </Select>

            <Select
              label="Destination Outlet / Branch"
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              required
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Items Table Card */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="panel-title">Line Items</div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={addItem}
              className="text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </Button>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <th>Raw Material / Item</th>
                <th className="w-28">Quantity</th>
                <th className="w-36">Unit Cost (Rs.)</th>
                <th className="text-right">Line Total</th>
                <th className="w-12 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <select
                      className="select w-full"
                      value={item.rawMaterialId}
                      onChange={(e) =>
                        updateItem(idx, "rawMaterialId", e.target.value)
                      }
                    >
                      {rawMaterials.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.unitName})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.1"
                      className="input w-full"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(idx, "quantity", e.target.value)
                      }
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      className="input w-full"
                      value={item.unitCost}
                      onChange={(e) =>
                        updateItem(idx, "unitCost", e.target.value)
                      }
                      required
                    />
                  </td>
                  <td className="font-bold text-xs text-text-dark text-right">
                    {formatCurrency(item.totalCost)}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      disabled={items.length <= 1}
                      className="act-btn act-delete disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center pt-3 border-t border-border text-sm font-black text-text-dark">
            <span>Total Purchase Amount:</span>
            <span className="text-patina text-base">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="default"
            onClick={() => router.push("/purchase-order/all")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="orange" className="flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4" /> Submit Purchase Order
          </Button>
        </div>
      </form>
    </div>
  );
}
