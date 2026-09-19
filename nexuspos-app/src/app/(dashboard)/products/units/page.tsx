"use client";

import React, { useState } from "react";
import { Plus, SquarePen, Trash2, Scale } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/db";
import { Unit } from "@/types";
import { toast } from "sonner";

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>(db.units);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [name, setName] = useState("");
  const [abbreviation, setAbbreviation] = useState("");

  const handleOpenAdd = () => {
    setEditingUnit(null);
    setName("");
    setAbbreviation("");
    setIsOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setName(unit.name);
    setAbbreviation(unit.abbreviation);
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !abbreviation.trim()) return;

    if (editingUnit) {
      editingUnit.name = name;
      editingUnit.abbreviation = abbreviation;
      toast.success(`Unit "${name}" updated!`);
    } else {
      const newUnit: Unit = {
        id: db.units.length + 1,
        name,
        abbreviation,
      };
      db.units.push(newUnit);
      toast.success(`Unit "${name}" created!`);
    }

    setUnits([...db.units]);
    setIsOpen(false);
  };

  const handleDelete = (id: number, uName: string) => {
    if (!confirm(`Delete unit "${uName}"?`)) return;
    const idx = db.units.findIndex((u) => u.id === id);
    if (idx !== -1) {
      db.units.splice(idx, 1);
      setUnits([...db.units]);
      toast.info(`Unit "${uName}" deleted`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Units of Measure</h1>
          <div className="page-sub">
            Configure units for recipe calculation, raw ingredient purchase, and inventory
          </div>
        </div>
        <Button variant="orange" onClick={handleOpenAdd} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Unit
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Defined Measurement Units</div>
          <div className="text-xs text-text-gray">Total {units.length} units</div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Unit Name</th>
              <th>Abbreviation</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <Scale className="w-4 h-4 text-patina" /> {unit.name}
                  </div>
                </td>
                <td className="text-xs font-mono font-bold text-patina">
                  {unit.abbreviation}
                </td>
                <td className="text-right actions-cell">
                  <button className="act-btn" onClick={() => handleOpenEdit(unit)} title="Edit">
                    <SquarePen className="w-4 h-4 text-patina" />
                  </button>
                  <button className="act-btn act-delete" onClick={() => handleDelete(unit.id, unit.name)} title="Delete">
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
        title={editingUnit ? "Edit Unit" : "New Unit"}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Unit Name"
            placeholder="e.g. Kilograms"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Abbreviation"
            placeholder="e.g. kg"
            value={abbreviation}
            onChange={(e) => setAbbreviation(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              {editingUnit ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
