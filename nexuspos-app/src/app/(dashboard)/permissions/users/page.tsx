"use client";

import React, { useState } from "react";
import { Plus, ShieldCheck, User, Lock, Key } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { db } from "@/lib/db";
import { User as UserType, UserRole } from "@/types";
import { toast } from "sonner";

export default function UsersPermissionsPage() {
  const [users, setUsers] = useState<UserType[]>(db.users);
  const [branches] = useState(db.branches);
  const [isOpen, setIsOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("CASHIER");
  const [branchId, setBranchId] = useState(1);
  const [pinCode, setPinCode] = useState("1234");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim()) return;

    const selBranch = branches.find((b) => b.id === Number(branchId));

    const newUser = {
      id: db.users.length + 1,
      username: username.toLowerCase(),
      name,
      role,
      mustChangePassword: true,
      branchId: Number(branchId),
      branchName: selBranch?.name,
      passwordHash: "default",
      pinHash: "default",
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    setUsers([...db.users]);
    toast.success(`User "${username}" created with default role ${role}!`);
    setIsOpen(false);
    setUsername("");
    setName("");
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Users &amp; Role-Based Access Control (RBAC)</h1>
          <div className="page-sub">
            Administrative logins, cashier register accounts, and 4-digit manager authorization PINs
          </div>
        </div>
        <Button variant="orange" onClick={() => setIsOpen(true)} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Create User Account
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">System User Accounts</div>
          <div className="text-xs text-text-gray">Total {users.length} accounts</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Username</th>
              <th>Assigned Role</th>
              <th>Assigned Branch</th>
              <th>First Login Security</th>
              <th>PIN Configured</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <User className="w-4 h-4 text-patina" /> {u.name}
                  </div>
                </td>
                <td className="font-mono text-xs font-bold text-patina">
                  @{u.username}
                </td>
                <td>
                  <Badge
                    variant={
                      u.role === "ADMINISTRATOR"
                        ? "red"
                        : u.role === "MANAGER"
                        ? "orange"
                        : u.role === "BARISTA"
                        ? "purple"
                        : "green"
                    }
                  >
                    {u.role}
                  </Badge>
                </td>
                <td className="text-xs text-text-gray">{u.branchName || "All Outlets"}</td>
                <td>
                  <Badge variant={u.mustChangePassword ? "orange" : "green"}>
                    {u.mustChangePassword ? "Requires Reset" : "Verified"}
                  </Badge>
                </td>
                <td className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-emerald-600" /> Active PIN
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create System User Account"
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Staff Name"
            placeholder="e.g. Kasun Wickrama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Username (Login Handle)"
            placeholder="e.g. kasunw"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <Select
            label="System Access Role"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            required
          >
            <option value="ADMINISTRATOR">Administrator (Full Access)</option>
            <option value="MANAGER">Store Manager (Discounts &amp; PIN Overrides)</option>
            <option value="CASHIER">Cashier (POS Register &amp; Sales)</option>
            <option value="BARISTA">Barista (Kitchen Display KDS)</option>
            <option value="INVENTORY_MANAGER">Inventory Manager (Stock &amp; GRN)</option>
          </Select>
          <Select
            label="Branch / Store"
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
          <Input
            label="4-Digit Manager PIN"
            type="password"
            maxLength={4}
            placeholder="1234"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              Create User Account
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
