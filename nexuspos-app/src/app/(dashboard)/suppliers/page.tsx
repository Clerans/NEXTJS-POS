"use client";

import React, { useState } from "react";
import { Plus, Truck, Search, Phone, Mail, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { Supplier } from "@/types";
import { toast } from "sonner";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(db.suppliers);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingSup, setEditingSup] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    paymentTerms: "NET 30",
  });

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingSup(null);
    setFormData({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      paymentTerms: "NET 30",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSup(sup);
    setFormData({
      name: sup.name,
      contactPerson: sup.contactPerson || "",
      phone: sup.phone,
      email: sup.email || "",
      paymentTerms: sup.paymentTerms,
    });
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    if (editingSup) {
      editingSup.name = formData.name;
      editingSup.contactPerson = formData.contactPerson;
      editingSup.phone = formData.phone;
      editingSup.email = formData.email;
      editingSup.paymentTerms = formData.paymentTerms;
      toast.success(`Supplier "${formData.name}" updated!`);
    } else {
      const code = `SUP-${String(db.suppliers.length + 1).padStart(3, "0")}`;
      const newSup: Supplier = {
        id: db.suppliers.length + 1,
        code,
        name: formData.name,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        paymentTerms: formData.paymentTerms,
        balance: 0,
      };
      db.suppliers.push(newSup);
      toast.success(`Supplier "${formData.name}" added (${code})`);
    }

    setSuppliers([...db.suppliers]);
    setIsOpen(false);
  };

  const handleDelete = (id: number, sName: string) => {
    if (!confirm(`Delete supplier "${sName}"?`)) return;
    const idx = db.suppliers.findIndex((s) => s.id === id);
    if (idx !== -1) {
      db.suppliers.splice(idx, 1);
      setSuppliers([...db.suppliers]);
      toast.info(`Supplier "${sName}" removed`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Suppliers Directory</h1>
          <div className="page-sub">
            Manage ingredient vendors, payment terms, and procurement payables
          </div>
        </div>
        <Button variant="orange" onClick={handleOpenAdd} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Supplier
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Active Suppliers</div>
          <div className="text-xs text-text-gray">Total {suppliers.length} vendors</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search vendor name, contact person, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Phone / Email</th>
              <th>Payment Terms</th>
              <th>Outstanding Balance</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <Truck className="w-4 h-4 text-patina" /> {s.name}
                  </div>
                  <div className="text-[10px] text-text-gray font-mono">{s.code}</div>
                </td>
                <td className="text-xs font-semibold text-text-dark">
                  {s.contactPerson || "-"}
                </td>
                <td className="text-xs text-text-gray">
                  <div>{s.phone}</div>
                  <div className="text-[10px] text-patina">{s.email}</div>
                </td>
                <td>
                  <Badge variant="orange">{s.paymentTerms}</Badge>
                </td>
                <td className="font-black text-xs text-text-dark">
                  {formatCurrency(s.balance ?? 0)}
                </td>
                <td className="text-right actions-cell">
                  <button className="act-btn" onClick={() => handleOpenEdit(s)} title="Edit">
                    <SquarePen className="w-4 h-4 text-patina" />
                  </button>
                  <button className="act-btn act-delete" onClick={() => handleDelete(s.id, s.name)} title="Delete">
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
        title={editingSup ? "Edit Supplier" : "Add Supplier"}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Supplier / Company Name"
            placeholder="e.g. Ceylon Coffee Roasters Ltd"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Contact Person"
            placeholder="e.g. Anil Gunawardena"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
          />
          <Input
            label="Phone Number"
            placeholder="+94 77 123 4567"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="orders@ceylonroasters.lk"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div>
            <label className="block text-xs font-bold text-text-dark mb-1">
              Payment Terms
            </label>
            <select
              className="select w-full"
              value={formData.paymentTerms}
              onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
            >
              <option value="NET 15">NET 15 Days</option>
              <option value="NET 30">NET 30 Days</option>
              <option value="NET 45">NET 45 Days</option>
              <option value="CASH_ON_DELIVERY">Cash on Delivery</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              {editingSup ? "Save Changes" : "Create Supplier"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
