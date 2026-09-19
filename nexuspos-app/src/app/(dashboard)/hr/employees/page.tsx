"use client";

import React, { useState } from "react";
import { Plus, User, Search, Phone, Mail, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { db } from "@/lib/db";
import { Employee } from "@/types";
import { toast } from "sonner";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(db.employees);
  const [jobs] = useState(db.jobs);
  const [branches] = useState(db.branches);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    jobTitle: jobs[0]?.title || "Senior Barista",
    branch: branches[0]?.name || "NEXUS Main Outlet",
    mobile: "",
    email: "",
    salary: "75000",
  });

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeCode.toLowerCase().includes(search.toLowerCase()) ||
      e.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      name: "",
      jobTitle: jobs[0]?.title || "Senior Barista",
      branch: branches[0]?.name || "NEXUS Main Outlet",
      mobile: "",
      email: "",
      salary: "75000",
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData({
      name: emp.name,
      jobTitle: emp.jobTitle,
      branch: emp.branch,
      mobile: emp.mobile,
      email: emp.email || "",
      salary: String(emp.salary || 75000),
    });
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim()) return;

    if (editingEmp) {
      editingEmp.name = formData.name;
      editingEmp.jobTitle = formData.jobTitle;
      editingEmp.branch = formData.branch;
      editingEmp.mobile = formData.mobile;
      editingEmp.email = formData.email;
      editingEmp.salary = parseFloat(formData.salary) || 75000;
      toast.success(`Employee profile "${formData.name}" updated!`);
    } else {
      const code = `EMP-${String(db.employees.length + 1).padStart(3, "0")}`;
      const newEmp: Employee = {
        id: db.employees.length + 1,
        employeeCode: code,
        name: formData.name,
        jobTitle: formData.jobTitle,
        branch: formData.branch,
        mobile: formData.mobile,
        email: formData.email,
        employmentStatus: "ACTIVE",
        hiredDate: new Date().toISOString().slice(0, 10),
        salary: parseFloat(formData.salary) || 75000,
      };
      db.employees.push(newEmp);
      toast.success(`Employee "${formData.name}" registered (${code})`);
    }

    setEmployees([...db.employees]);
    setIsOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Employee Directory</h1>
          <div className="page-sub">
            Staff master profiles, store designations, and compensation records
          </div>
        </div>
        <Button variant="orange" onClick={handleOpenAdd} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Employee
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Active Staff Members</div>
          <div className="text-xs text-text-gray">Total {employees.length} employees</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search staff name, designation, employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Employee Details</th>
              <th>Designation</th>
              <th>Assigned Outlet</th>
              <th>Contact Info</th>
              <th>Hired Date</th>
              <th>Base Salary</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp) => (
              <tr key={emp.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <User className="w-4 h-4 text-patina" /> {emp.name}
                  </div>
                  <div className="text-[10px] text-text-gray font-mono">{emp.employeeCode}</div>
                </td>
                <td className="text-xs font-semibold text-text-dark">
                  {emp.jobTitle}
                </td>
                <td className="text-xs text-text-gray">{emp.branch}</td>
                <td className="text-xs text-text-gray">
                  <div>{emp.mobile}</div>
                  <div className="text-[10px] text-patina">{emp.email}</div>
                </td>
                <td className="text-xs text-text-gray font-medium">
                  {formatDate(emp.hiredDate)}
                </td>
                <td className="font-black text-xs text-patina">
                  {formatCurrency(emp.salary ?? 0)}
                </td>
                <td>
                  <Badge variant="green">{emp.employmentStatus}</Badge>
                </td>
                <td className="text-right actions-cell">
                  <button className="act-btn" onClick={() => handleOpenEdit(emp)} title="Edit">
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
        title={editingEmp ? "Edit Employee" : "Add Employee"}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Nimali Silva"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Select
            label="Job Designation"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            required
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.title}>
                {j.title} ({j.department})
              </option>
            ))}
          </Select>
          <Select
            label="Assigned Branch / Outlet"
            value={formData.branch}
            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
            required
          >
            {branches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </Select>
          <Input
            label="Mobile Phone"
            placeholder="+94 77 222 3344"
            value={formData.mobile}
            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="staff@nexuspos.lk"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Monthly Base Salary (Rs.)"
            type="number"
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              {editingEmp ? "Save Changes" : "Register Employee"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
