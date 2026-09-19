"use client";

import React, { useState } from "react";
import { Plus, SquarePen, Trash2, Search, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/db";
import { Category } from "@/types";
import { toast } from "sonner";

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>(db.categories);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName("");
    setDescription("");
    setIsOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCat(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCat) {
      editingCat.name = name;
      editingCat.description = description;
      toast.success(`Category "${name}" updated!`);
    } else {
      const newCat: Category = {
        id: db.categories.length + 1,
        name,
        description,
        productCount: 0,
      };
      db.categories.push(newCat);
      toast.success(`Category "${name}" created!`);
    }

    setCategories([...db.categories]);
    setIsOpen(false);
  };

  const handleDelete = (id: number, catName: string) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    const idx = db.categories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      db.categories.splice(idx, 1);
      setCategories([...db.categories]);
      toast.info(`Category "${catName}" removed`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Categories</h1>
          <div className="page-sub">
            Organize products and raw material groups
          </div>
        </div>
        <Button variant="orange" onClick={handleOpenAdd} className="flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Product Categories</div>
          <div className="text-xs text-text-gray">Total {categories.length} categories</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Description</th>
              <th>Linked Products</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((cat) => (
              <tr key={cat.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <Layers className="w-4 h-4 text-patina" /> {cat.name}
                  </div>
                </td>
                <td className="text-xs text-text-gray">{cat.description || "-"}</td>
                <td>
                  <Badge variant="orange">{cat.productCount ?? 0} Products</Badge>
                </td>
                <td className="text-right actions-cell">
                  <button className="act-btn" onClick={() => handleOpenEdit(cat)} title="Edit">
                    <SquarePen className="w-4 h-4 text-patina" />
                  </button>
                  <button className="act-btn act-delete" onClick={() => handleDelete(cat.id, cat.name)} title="Delete">
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
        title={editingCat ? "Edit Category" : "New Category"}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g. Desserts"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-bold text-text-dark mb-1">
              Description
            </label>
            <textarea
              className="textarea"
              placeholder="Category overview..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="default" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              {editingCat ? "Save Changes" : "Create"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
