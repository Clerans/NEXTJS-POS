"use client";

import React, { useState } from "react";
import { Plus, Building2, Phone, MapPin, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/db";
import { Branch } from "@/types";
import { toast } from "sonner";

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>(db.branches);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const newBranch: Branch = {
      id: db.branches.length + 1,
      code: code.toUpperCase(),
      name,
      address,
      phone,
      isActive: true,
    };

    db.branches.push(newBranch);
    setBranches([...db.branches]);
    toast.success(`Store Branch "${name}" registered successfully!`);
    setIsOpen(false);
    setName("");
    setCode("");
    setAddress("");
    setPhone("");
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Store Branches</h1>
          <div className="page-sub">
            Multi-location restaurant &amp; retail outlet master management
          </div>
        </div>
        <Button variant="orange" onClick={() => setIsOpen(true)} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Branch
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Active Outlets</div>
          <div className="text-xs text-text-gray">Total {branches.length} locations</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Branch Details</th>
              <th>Branch Code</th>
              <th>Physical Address</th>
              <th>Phone Hotline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b) => (
              <tr key={b.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-patina" /> {b.name}
                  </div>
                </td>
                <td className="font-mono font-bold text-xs text-patina">
                  {b.code}
                </td>
                <td className="text-xs text-text-gray">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-text-gray" /> {b.address}
                  </div>
                </td>
                <td className="text-xs text-text-gray">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-text-gray" /> {b.phone}
                  </div>
                </td>
                <td>
                  <Badge variant={b.isActive ? "green" : "gray"}>
                    {b.isActive ? "Active" : "Closed"}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Store Outlet Branch"
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Branch Name"
            placeholder="e.g. Negombo Coastal Outlet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Branch Short Code"
            placeholder="e.g. NEGM"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
          <Input
            label="Physical Address"
            placeholder="e.g. 54 Beach Road, Negombo"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <Input
            label="Phone Contact"
            placeholder="e.g. +94 31 222 3333"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              Register Branch
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
