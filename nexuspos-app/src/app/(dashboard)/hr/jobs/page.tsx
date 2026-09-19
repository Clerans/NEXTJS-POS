"use client";

import React, { useState } from "react";
import { Plus, Briefcase, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/db";
import { JobTitle } from "@/types";
import { toast } from "sonner";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobTitle[]>(db.jobs);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Operations");
  const [description, setDescription] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newJob: JobTitle = {
      id: db.jobs.length + 1,
      title,
      department,
      description,
      employeeCount: 0,
    };

    db.jobs.push(newJob);
    setJobs([...db.jobs]);
    toast.success(`Job Designation "${title}" created!`);
    setIsOpen(false);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Job Designations</h1>
          <div className="page-sub">
            Staff positions, store operational departments, and role specifications
          </div>
        </div>
        <Button variant="orange" onClick={() => setIsOpen(true)} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Designation
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Defined Job Roles</div>
          <div className="text-xs text-text-gray">Total {jobs.length} designations</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Designation Title</th>
              <th>Department</th>
              <th>Role Description</th>
              <th>Active Headcount</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-patina" /> {j.title}
                  </div>
                </td>
                <td>
                  <Badge variant="blue">{j.department}</Badge>
                </td>
                <td className="text-xs text-text-gray">{j.description || "-"}</td>
                <td className="font-bold text-xs text-text-dark">
                  {j.employeeCount ?? 0} staff
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Job Designation"
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Job Title"
            placeholder="e.g. Senior Barista"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Department"
            placeholder="e.g. Front of House"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-bold text-text-dark mb-1">
              Role Scope Description
            </label>
            <textarea
              className="textarea w-full text-xs"
              placeholder="Responsibilities overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              Create Role
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
