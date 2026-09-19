"use client";

import React, { useState } from "react";
import { Plus, Users, Search, Award, CreditCard, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { Customer } from "@/types";
import { toast } from "sonner";

export default function AllCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(db.customers);
  const [groups] = useState(db.customerGroups);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingCust, setEditingCust] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    groupId: 1,
    creditLimit: "50000",
  });

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.customerCode.toLowerCase().includes(search.toLowerCase()) ||
      c.mobile.includes(search)
  );

  const handleOpenAdd = () => {
    setEditingCust(null);
    setFormData({
      name: "",
      mobile: "",
      email: "",
      groupId: groups[0]?.id || 1,
      creditLimit: "50000",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditingCust(cust);
    setFormData({
      name: cust.name,
      mobile: cust.mobile,
      email: cust.email || "",
      groupId: cust.groupId || 1,
      creditLimit: String(cust.creditLimit),
    });
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim()) return;
    const selGroup = groups.find((g) => g.id === Number(formData.groupId));

    if (editingCust) {
      editingCust.name = formData.name;
      editingCust.mobile = formData.mobile;
      editingCust.email = formData.email;
      editingCust.groupId = Number(formData.groupId);
      editingCust.groupName = selGroup?.name;
      editingCust.discountRate = selGroup?.discountRate || 0;
      editingCust.creditLimit = parseFloat(formData.creditLimit) || 0;
      toast.success(`Customer profile "${formData.name}" updated!`);
    } else {
      const code = `CUST-${String(db.customers.length + 1).padStart(3, "0")}`;
      const newCust: Customer = {
        id: db.customers.length + 1,
        customerCode: code,
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        groupId: Number(formData.groupId),
        groupName: selGroup?.name,
        discountRate: selGroup?.discountRate || 0,
        loyaltyPoints: 100,
        outstandingBalance: 0,
        creditLimit: parseFloat(formData.creditLimit) || 50000,
      };
      db.customers.push(newCust);
      toast.success(`Customer "${formData.name}" registered (${code})`);
    }

    setCustomers([...db.customers]);
    setIsOpen(false);
  };

  const handleDelete = (id: number, cName: string) => {
    if (!confirm(`Delete customer profile "${cName}"?`)) return;
    const idx = db.customers.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.customers.splice(idx, 1);
      setCustomers([...db.customers]);
      toast.info(`Customer "${cName}" removed`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Customers Registry</h1>
          <div className="page-sub">
            Profiles, loyalty reward balances, credit limits, and tier discounts
          </div>
        </div>
        <Button variant="orange" onClick={handleOpenAdd} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Registered Customer Accounts</div>
          <div className="text-xs text-text-gray">Total {customers.length} accounts</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search by name, mobile, or customer code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Contact Info</th>
              <th>Customer Group</th>
              <th>Loyalty Points</th>
              <th>Credit Limit</th>
              <th>Outstanding</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <Users className="w-4 h-4 text-patina" /> {c.name}
                  </div>
                  <div className="text-[10px] text-text-gray font-mono">{c.customerCode}</div>
                </td>
                <td className="text-xs text-text-gray">
                  <div>{c.mobile}</div>
                  <div className="text-[10px] text-patina">{c.email}</div>
                </td>
                <td>
                  <Badge variant="orange">{c.groupName || "Regular"}</Badge>
                </td>
                <td className="font-bold text-xs text-amber-600 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> {c.loyaltyPoints} pts
                </td>
                <td className="text-xs font-semibold text-text-dark">
                  {formatCurrency(c.creditLimit)}
                </td>
                <td className="font-black text-xs text-patina">
                  {formatCurrency(c.outstandingBalance)}
                </td>
                <td className="text-right actions-cell">
                  <button className="act-btn" onClick={() => handleOpenEdit(c)} title="Edit">
                    <SquarePen className="w-4 h-4 text-patina" />
                  </button>
                  <button className="act-btn act-delete" onClick={() => handleDelete(c.id, c.name)} title="Delete">
                    <Trash2 className="w-4 h-4" />
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
        title={editingCust ? "Edit Customer Profile" : "Register Customer"}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Customer Name"
            placeholder="e.g. Dr. Dinesh Jayawardena"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Mobile Phone Number"
            placeholder="+94 77 123 4567"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="customer@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Select
            label="Customer Group / Tier"
            value={formData.groupId}
            onChange={(e) => setFormData({ ...formData, groupId: Number(e.target.value) })}
            required
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.discountRate}% Discount)
              </option>
            ))}
          </Select>
          <Input
            label="Approved Credit Limit (Rs.)"
            type="number"
            placeholder="50000"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              {editingCust ? "Save Profile" : "Create Customer"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
