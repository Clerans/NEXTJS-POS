"use client";

import React, { useState } from "react";
import { Plus, SquarePen, Trash2, Search, Wheat } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { RawMaterial } from "@/types";
import { toast } from "sonner";

export default function RawMaterialsPage() {
  const [materials, setMaterials] = useState<RawMaterial[]>(db.rawMaterials);
  const [units] = useState(db.units);
  const [search, setSearch] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [editingMat, setEditingMat] = useState<RawMaterial | null>(null);

  const [name, setName] = useState("");
  const [unitId, setUnitId] = useState(2);
  const [costPerUnit, setCostPerUnit] = useState("");
  const [reorderLevel, setReorderLevel] = useState("10");

  const filtered = materials.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingMat(null);
    setName("");
    setUnitId(units[0]?.id || 1);
    setCostPerUnit("");
    setReorderLevel("10");
    setIsOpen(true);
  };

  const handleOpenEdit = (m: RawMaterial) => {
    setEditingMat(m);
    setName(m.name);
    setUnitId(m.unitId);
    setCostPerUnit(String(m.costPerUnit));
    setReorderLevel(String(m.reorderLevel));
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selUnit = units.find((u) => u.id === Number(unitId));
    const cost = parseFloat(costPerUnit) || 0;
    const reorder = parseFloat(reorderLevel) || 10;

    if (editingMat) {
      editingMat.name = name;
      editingMat.unitId = Number(unitId);
      editingMat.unitName = selUnit?.abbreviation;
      editingMat.costPerUnit = cost;
      editingMat.reorderLevel = reorder;
      toast.success(`Raw Material "${name}" updated!`);
    } else {
      const code = `RAW-${String(db.rawMaterials.length + 1).padStart(3, "0")}`;
      const newMat: RawMaterial = {
        id: db.rawMaterials.length + 1,
        code,
        name,
        unitId: Number(unitId),
        unitName: selUnit?.abbreviation,
        costPerUnit: cost,
        reorderLevel: reorder,
        currentStock: 25,
      };
      db.rawMaterials.push(newMat);
      toast.success(`Raw Material "${name}" created (${code})`);
    }

    setMaterials([...db.rawMaterials]);
    setIsOpen(false);
  };

  const handleDelete = (id: number, mName: string) => {
    if (!confirm(`Delete raw material "${mName}"?`)) return;
    const idx = db.rawMaterials.findIndex((m) => m.id === id);
    if (idx !== -1) {
      db.rawMaterials.splice(idx, 1);
      setMaterials([...db.rawMaterials]);
      toast.info(`Raw Material "${mName}" deleted`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Raw Materials Directory</h1>
          <div className="page-sub">
            Ingredient master data and baseline procurement unit costs
          </div>
        </div>
        <Button variant="orange" onClick={handleOpenAdd} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Raw Material
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Ingredients & Supplies</div>
          <div className="text-xs text-text-gray">Total {materials.length} raw materials</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search raw material name, code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Material Details</th>
              <th>Unit</th>
              <th>Cost per Unit</th>
              <th>Reorder Alert Level</th>
              <th>Current Stock</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((mat) => (
              <tr key={mat.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <Wheat className="w-4 h-4 text-patina" /> {mat.name}
                  </div>
                  <div className="text-[10px] text-text-gray font-mono">{mat.code}</div>
                </td>
                <td className="text-xs font-bold text-patina">{mat.unitName}</td>
                <td className="font-bold text-xs text-text-dark">
                  {formatCurrency(mat.costPerUnit)} / {mat.unitName}
                </td>
                <td className="text-xs text-text-gray font-semibold">
                  {mat.reorderLevel} {mat.unitName}
                </td>
                <td className="font-black text-xs text-text-dark">
                  {mat.currentStock ?? 0} {mat.unitName}
                </td>
                <td className="text-right actions-cell">
                  <button className="act-btn" onClick={() => handleOpenEdit(mat)} title="Edit">
                    <SquarePen className="w-4 h-4 text-patina" />
                  </button>
                  <button className="act-btn act-delete" onClick={() => handleDelete(mat.id, mat.name)} title="Delete">
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
        title={editingMat ? "Edit Raw Material" : "Add Raw Material"}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Material Name"
            placeholder="e.g. Premium Arabica Beans"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Select
            label="Base Unit"
            value={unitId}
            onChange={(e) => setUnitId(Number(e.target.value))}
            required
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.abbreviation})
              </option>
            ))}
          </Select>
          <Input
            label="Cost Per Unit (Rs.)"
            type="number"
            step="0.01"
            placeholder="6500.00"
            value={costPerUnit}
            onChange={(e) => setCostPerUnit(e.target.value)}
            required
          />
          <Input
            label="Reorder Alert Threshold"
            type="number"
            placeholder="20"
            value={reorderLevel}
            onChange={(e) => setReorderLevel(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              {editingMat ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
