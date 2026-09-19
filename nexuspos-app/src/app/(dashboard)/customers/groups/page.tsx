"use client";

import React, { useState } from "react";
import { Plus, Users2, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/db";
import { CustomerGroup } from "@/types";
import { toast } from "sonner";

export default function CustomerGroupsPage() {
  const [groups, setGroups] = useState<CustomerGroup[]>(db.customerGroups);
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null);

  const [name, setName] = useState("");
  const [discountRate, setDiscountRate] = useState("0");

  const handleOpenAdd = () => {
    setEditingGroup(null);
    setName("");
    setDiscountRate("0");
    setIsOpen(true);
  };

  const handleOpenEdit = (group: CustomerGroup) => {
    setEditingGroup(group);
    setName(group.name);
    setDiscountRate(String(group.discountRate));
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const rate = parseFloat(discountRate) || 0;

    if (editingGroup) {
      editingGroup.name = name;
      editingGroup.discountRate = rate;
      toast.success(`Group "${name}" updated!`);
    } else {
      const newGroup: CustomerGroup = {
        id: db.customerGroups.length + 1,
        name,
        discountRate: rate,
        customerCount: 0,
      };
      db.customerGroups.push(newGroup);
      toast.success(`Customer Group "${name}" created!`);
    }

    setGroups([...db.customerGroups]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Customer Groups &amp; Loyalty Tiers</h1>
          <div className="page-sub">
            Automated register percentage discounts and membership tiers
          </div>
        </div>
        <Button variant="orange" onClick={handleOpenAdd} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Customer Group
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Membership Groups</div>
          <div className="text-xs text-text-gray">Total {groups.length} groups</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Group Name</th>
              <th>Automatic Discount %</th>
              <th>Enrolled Customers</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-patina" /> {g.name}
                  </div>
                </td>
                <td className="font-black text-xs text-emerald-700">
                  {g.discountRate}% Discount
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {g.customerCount ?? 0} members
                </td>
                <td className="text-right actions-cell">
                  <button className="act-btn" onClick={() => handleOpenEdit(g)} title="Edit">
                    <SquarePen className="w-4 h-4 text-patina" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={editingGroup ? "Edit Group Tier" : "New Customer Group"}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Group / Tier Name"
            placeholder="e.g. VIP Elite Members"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Automatic POS Discount Rate (%)"
            type="number"
            step="0.5"
            placeholder="10.0"
            value={discountRate}
            onChange={(e) => setDiscountRate(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              {editingGroup ? "Save Changes" : "Create Group"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
