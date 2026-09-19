"use client";

import React, { useState } from "react";
import { Plus, BadgePercent, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatDate } from "@/lib/utils";
import { db } from "@/lib/db";
import { Promotion } from "@/types";
import { toast } from "sonner";

export default function AllPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(db.promotions);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState("2026-08-01");
  const [endDate, setEndDate] = useState("2026-08-31");

  const handleOpenAdd = () => {
    setEditingPromo(null);
    setCode("");
    setName("");
    setType("PERCENTAGE");
    setDiscountValue("15");
    setStartDate("2026-08-01");
    setEndDate("2026-08-31");
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    if (editingPromo) {
      editingPromo.code = code;
      editingPromo.name = name;
      editingPromo.type = type;
      editingPromo.discountValue = parseFloat(discountValue) || 0;
      editingPromo.startDate = startDate;
      editingPromo.endDate = endDate;
      toast.success(`Promotion "${name}" updated!`);
    } else {
      const newPromo: Promotion = {
        id: db.promotions.length + 1,
        code,
        name,
        type,
        discountValue: parseFloat(discountValue) || 0,
        startDate,
        endDate,
        status: "ACTIVE",
      };
      db.promotions.push(newPromo);
      toast.success(`Promotion code "${code}" created!`);
    }

    setPromotions([...db.promotions]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Discounts &amp; Promotions</h1>
          <div className="page-sub">
            Manage seasonal discount promo codes, marketing campaigns, and validity
          </div>
        </div>
        <Button variant="orange" onClick={handleOpenAdd} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Create Promotion
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Active Promotional Codes</div>
          <div className="text-xs text-text-gray">Total {promotions.length} promotions</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Promo Code</th>
              <th>Campaign Name</th>
              <th>Type</th>
              <th>Discount Value</th>
              <th>Validity Window</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-patina font-mono flex items-center gap-1.5">
                    <BadgePercent className="w-4 h-4" /> {p.code}
                  </div>
                </td>
                <td className="font-semibold text-xs text-text-dark">{p.name}</td>
                <td>
                  <Badge variant="blue">{p.type}</Badge>
                </td>
                <td className="font-black text-xs text-emerald-700">
                  {p.type === "PERCENTAGE"
                    ? `${p.discountValue}% Off`
                    : `Rs. ${p.discountValue} Off`}
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(p.startDate)} - {formatDate(p.endDate)}
                </td>
                <td>
                  <Badge variant="green">{p.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create Promotional Code"
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Promo Code (Voucher Code)"
            placeholder="e.g. SUMMER15"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          <Input
            label="Campaign Name"
            placeholder="e.g. Summer Special 15% Off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select
            label="Discount Type"
            value={type}
            onChange={(e) => setType(e.target.value as any)}
          >
            <option value="PERCENTAGE">Percentage (%) Off</option>
            <option value="FIXED_AMOUNT">Flat Amount (Rs.) Off</option>
          </Select>
          <Input
            label="Discount Value"
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              Create Promotion
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
