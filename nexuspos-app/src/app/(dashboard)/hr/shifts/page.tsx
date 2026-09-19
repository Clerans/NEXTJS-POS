"use client";

import React, { useState } from "react";
import { Plus, Clock, SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/db";
import { Shift } from "@/types";
import { toast } from "sonner";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>(db.shifts);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("06:30");
  const [endTime, setEndTime] = useState("15:00");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newShift: Shift = {
      id: db.shifts.length + 1,
      name,
      startTime,
      endTime,
      durationHours: 8.5,
    };

    db.shifts.push(newShift);
    setShifts([...db.shifts]);
    toast.success(`Shift Template "${name}" created!`);
    setIsOpen(false);
    setName("");
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Work Shifts</h1>
          <div className="page-sub">
            Opening, peak assist, and closing work shift templates
          </div>
        </div>
        <Button variant="orange" onClick={() => setIsOpen(true)} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Shift Template
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Defined Shifts</div>
          <div className="text-xs text-text-gray">Total {shifts.length} shifts</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Shift Name</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Standard Duration</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map((s) => (
              <tr key={s.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <Clock className="w-4 h-4 text-patina" /> {s.name}
                  </div>
                </td>
                <td className="font-bold text-xs text-text-dark">{s.startTime}</td>
                <td className="font-bold text-xs text-text-dark">{s.endTime}</td>
                <td className="text-xs font-semibold text-patina">
                  {s.durationHours} Hours
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="New Shift Template"
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Shift Title"
            placeholder="e.g. Morning Opening Shift"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              Create Shift
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
