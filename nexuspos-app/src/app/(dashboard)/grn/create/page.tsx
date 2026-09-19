"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { GRN, GRNItem } from "@/types";
import { toast } from "sonner";

export default function CreateGRNPage() {
  const router = useRouter();
  const [suppliers] = useState(db.suppliers);
  const [branches] = useState(db.branches);
  const [rawMaterials] = useState(db.rawMaterials);
  const [purchaseOrders] = useState(db.purchaseOrders);

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || 1);
  const [branchId, setBranchId] = useState(branches[0]?.id || 1);
  const [poId, setPoId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [items, setItems] = useState<GRNItem[]>([
    {
      rawMaterialId: rawMaterials[0]?.id || 1,
      rawMaterialName: rawMaterials[0]?.name,
      quantityReceived: 50,
      unitCost: rawMaterials[0]?.costPerUnit || 1000,
      totalCost: 50 * (rawMaterials[0]?.costPerUnit || 1000),
      batchNumber: "BATCH-NEW-01",
      expiryDate: "2027-01-01",
    },
  ]);

  const addItem = () => {
    const defaultMat = rawMaterials[0];
    setItems([
      ...items,
      {
        rawMaterialId: defaultMat?.id || 1,
        rawMaterialName: defaultMat?.name,
        quantityReceived: 10,
        unitCost: defaultMat?.costPerUnit || 1000,
        totalCost: 10 * (defaultMat?.costPerUnit || 1000),
        batchNumber: `BATCH-LOT-${Date.now().toString().slice(-4)}`,
        expiryDate: "2027-01-01",
      },
    ]);
  };

  const updateItem = (index: number, field: keyof GRNItem, value: any) => {
    const updated = [...items];
    const target = updated[index];

    if (field === "rawMaterialId") {
      const mat = rawMaterials.find((m) => m.id === Number(value));
      target.rawMaterialId = Number(value);
      target.rawMaterialName = mat?.name;
      target.unitCost = mat?.costPerUnit || 0;
      target.totalCost = target.quantityReceived * target.unitCost;
    } else if (field === "quantityReceived" || field === "unitCost") {
      target[field] = Number(value) || 0;
      target.totalCost = target.quantityReceived * target.unitCost;
    } else {
      (target as any)[field] = value;
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
    const selPO = purchaseOrders.find((p) => p.id === Number(poId));

    const grnNumber = `GRN-${new Date().getFullYear()}-${String(
      db.grns.length + 51
    ).padStart(4, "0")}`;

    const newGRN: GRN = {
      id: db.grns.length + 1,
      grnNumber,
      purchaseOrderId: poId ? Number(poId) : undefined,
      poNumber: selPO?.poNumber,
      supplierId: Number(supplierId),
      supplierName: selSup?.name,
      branchId: Number(branchId),
      branchName: selBranch?.name,
      invoiceNumber,
      totalAmount,
      paidAmount: 0,
      paymentStatus: "UNPAID",
      status: "VERIFIED",
      items,
      createdAt: new Date().toISOString(),
    };

    db.grns.unshift(newGRN);

    // Update stock in warehouse
    items.forEach((item) => {
      const mat = db.rawMaterials.find((m) => m.id === item.rawMaterialId);
      if (mat) {
        mat.currentStock = (mat.currentStock ?? 0) + item.quantityReceived;
      }
    });

    toast.success(`GRN ${grnNumber} generated & inventory updated!`);
    router.push("/grn/all");
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
          <h1 className="page-title">Create Goods Received Note (GRN)</h1>
          <div className="page-sub">
            Receive incoming vendor stock into inventory and assign batch numbers
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form Card */}
        <div className="card space-y-4">
          <div className="panel-title">Inward Information</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Supplier / Vendor"
              value={supplierId}
              onChange={(e) => setSupplierId(Number(e.target.value))}
              required
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>

            <Select
              label="Associated Purchase Order (Optional)"
              value={poId}
              onChange={(e) => setPoId(e.target.value)}
            >
              <option value="">Direct Inward Entry (No PO)</option>
              {purchaseOrders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.poNumber} - {p.supplierName} ({formatCurrency(p.totalAmount)})
                </option>
              ))}
            </Select>

            <Input
              label="Vendor Invoice / Delivery Order #"
              placeholder="e.g. INV-KOT-9982"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              required
            />

            <Select
              label="Receiving Warehouse / Branch"
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

        {/* Received Items Card */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <div className="panel-title">Received Material Lots</div>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={addItem}
              className="text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5" /> Add Material
            </Button>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <th>Item</th>
                <th className="w-24">Qty Recv</th>
                <th className="w-32">Unit Cost (Rs.)</th>
                <th className="w-32">Batch Code</th>
                <th className="w-32">Expiry Date</th>
                <th className="text-right">Total</th>
                <th className="w-10"></th>
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
                      value={item.quantityReceived}
                      onChange={(e) =>
                        updateItem(idx, "quantityReceived", e.target.value)
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
                  <td>
                    <input
                      type="text"
                      className="input w-full text-xs font-mono"
                      value={item.batchNumber || ""}
                      onChange={(e) =>
                        updateItem(idx, "batchNumber", e.target.value)
                      }
                      placeholder="BATCH-001"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      className="input w-full text-xs"
                      value={item.expiryDate || ""}
                      onChange={(e) =>
                        updateItem(idx, "expiryDate", e.target.value)
                      }
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
            <span>Total Inward Valuation:</span>
            <span className="text-patina text-base">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="default"
            onClick={() => router.push("/grn/all")}
          >
            Cancel
          </Button>
          <Button type="submit" variant="orange" className="flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4" /> Process &amp; Update Stock
          </Button>
        </div>
      </form>
    </div>
  );
}
