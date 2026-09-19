"use client";

import React, { useState } from "react";
import { Plus, Eye, SquarePen, Trash2, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { Product } from "@/types";
import { toast } from "sonner";

export default function AllProductsPage() {
  const [products, setProducts] = useState<Product[]>(db.products);
  const [categories] = useState(db.categories);
  const [units] = useState(db.units);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Add / Edit Modal State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    categoryId: 1,
    unitId: 1,
    retailPrice: "",
    costPrice: "",
    isRecipeBased: false,
    reorderLevel: "10",
    isActive: true,
  });

  const filtered = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat =
      categoryFilter === "All" || item.categoryName === categoryFilter;
    const matchesType =
      typeFilter === "All" ||
      (typeFilter === "Recipe" && item.isRecipeBased) ||
      (typeFilter === "Product" && !item.isRecipeBased);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && item.isActive) ||
      (statusFilter === "Inactive" && !item.isActive);
    return matchesSearch && matchesCat && matchesType && matchesStatus;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      categoryId: categories[0]?.id || 1,
      unitId: units[0]?.id || 1,
      retailPrice: "",
      costPrice: "",
      isRecipeBased: false,
      reorderLevel: "10",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      categoryId: product.categoryId || categories[0]?.id || 1,
      unitId: product.unitId || units[0]?.id || 1,
      retailPrice: String(product.retailPrice),
      costPrice: String(product.costPrice),
      isRecipeBased: product.isRecipeBased,
      reorderLevel: String(product.reorderLevel),
      isActive: product.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const selCat = categories.find((c) => c.id === Number(formData.categoryId));
    const selUnit = units.find((u) => u.id === Number(formData.unitId));
    const retail = parseFloat(formData.retailPrice) || 0;
    const cost = parseFloat(formData.costPrice) || 0;

    if (editingProduct) {
      editingProduct.name = formData.name;
      editingProduct.categoryId = Number(formData.categoryId);
      editingProduct.categoryName = selCat?.name;
      editingProduct.unitId = Number(formData.unitId);
      editingProduct.unitName = selUnit?.abbreviation;
      editingProduct.retailPrice = retail;
      editingProduct.costPrice = cost;
      editingProduct.pickmePrice = retail * 1.15;
      editingProduct.uberPrice = retail * 1.15;
      editingProduct.isRecipeBased = formData.isRecipeBased;
      editingProduct.reorderLevel = parseFloat(formData.reorderLevel) || 10;
      editingProduct.isActive = formData.isActive;
      toast.success(`Product "${formData.name}" updated successfully!`);
    } else {
      const newProduct: Product = {
        id: db.products.length + 1,
        sku: db.generateSku(selCat?.name || "GEN"),
        name: formData.name,
        categoryId: Number(formData.categoryId),
        categoryName: selCat?.name,
        unitId: Number(formData.unitId),
        unitName: selUnit?.abbreviation,
        retailPrice: retail,
        costPrice: cost,
        pickmePrice: retail * 1.15,
        uberPrice: retail * 1.15,
        isRecipeBased: formData.isRecipeBased,
        reorderLevel: parseFloat(formData.reorderLevel) || 10,
        isActive: formData.isActive,
        stock: 50,
      };
      db.products.unshift(newProduct);
      toast.success(`Product "${formData.name}" created (${newProduct.sku})`);
    }

    setProducts([...db.products]);
    setIsDialogOpen(false);
  };

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"?`)) return;
    const idx = db.products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      db.products.splice(idx, 1);
      setProducts([...db.products]);
      toast.info(`Product "${name}" deleted`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Row */}
      <div className="page-head-row">
        <div>
          <h1 className="page-title">All Products</h1>
          <div className="page-sub">
            Manage outlet menu items, 3rd party pricing tiers, and recipe bindings
          </div>
        </div>
        <Button
          variant="orange"
          onClick={handleOpenAdd}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Catalog Table Card */}
      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Product Catalog</div>
          <div className="text-xs text-text-gray">
            Showing {filtered.length} of {products.length} products
          </div>
        </div>

        {/* Filters */}
        <div className="filters-grid four">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search SKU code or product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select w-full"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="select w-full"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Product">Standard Product</option>
            <option value="Recipe">Recipe Formula</option>
          </select>

          <select
            className="select w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Data Table */}
        <table className="w-full">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Category</th>
              <th>Type</th>
              <th>Outlet Price</th>
              <th>Third-Party (PickMe / Uber)</th>
              <th>Stock</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-patina-light/50">
                  <td>
                    <div className="font-bold text-xs text-text-dark">
                      {item.name}
                    </div>
                    <div className="text-[10px] text-text-gray font-mono">
                      {item.sku}
                    </div>
                  </td>
                  <td className="text-xs text-text-gray font-medium">
                    {item.categoryName}
                  </td>
                  <td>
                    <Badge variant={item.isRecipeBased ? "orange" : "blue"}>
                      {item.isRecipeBased ? "Recipe" : "Product"}
                    </Badge>
                  </td>
                  <td className="font-bold text-xs text-text-dark">
                    {formatCurrency(item.retailPrice)}
                  </td>
                  <td className="text-[11px] text-text-gray">
                    <div>PickMe: {formatCurrency(item.pickmePrice || item.retailPrice * 1.15)}</div>
                    <div>Uber: {formatCurrency(item.uberPrice || item.retailPrice * 1.15)}</div>
                  </td>
                  <td className="font-semibold text-xs text-text-dark">
                    {item.stock ?? 100} {item.unitName || "pcs"}
                  </td>
                  <td>
                    <Badge variant={item.isActive ? "green" : "gray"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="text-right actions-cell">
                    <button
                      className="act-btn"
                      title="Quick View"
                      onClick={() =>
                        toast.info(`SKU: ${item.sku} | Cost: Rs. ${item.costPrice}`)
                      }
                    >
                      <Eye className="w-4 h-4 text-text-gray" />
                    </button>
                    <button
                      className="act-btn"
                      title="Edit Product"
                      onClick={() => handleOpenEdit(item)}
                    >
                      <SquarePen className="w-4 h-4 text-patina" />
                    </button>
                    <button
                      className="act-btn act-delete"
                      title="Delete Product"
                      onClick={() => handleDelete(item.id, item.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-8 text-xs text-text-gray">
                  No products found. Click &quot;Add Product&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Create / Edit Modal */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
        description="Configure menu item details, category, and pricing tiers"
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Product Name"
            placeholder="e.g. Caffe Latte (Large)"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: Number(e.target.value) })
              }
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Unit of Measure"
              value={formData.unitId}
              onChange={(e) =>
                setFormData({ ...formData, unitId: Number(e.target.value) })
              }
              required
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.abbreviation})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Retail Outlet Price (Rs.)"
              type="number"
              step="0.01"
              placeholder="850.00"
              value={formData.retailPrice}
              onChange={(e) =>
                setFormData({ ...formData, retailPrice: e.target.value })
              }
              required
            />

            <Input
              label="Estimated Cost (Rs.)"
              type="number"
              step="0.01"
              placeholder="280.00"
              value={formData.costPrice}
              onChange={(e) =>
                setFormData({ ...formData, costPrice: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Low Stock Reorder Alert Level"
              type="number"
              placeholder="10"
              value={formData.reorderLevel}
              onChange={(e) =>
                setFormData({ ...formData, reorderLevel: e.target.value })
              }
            />

            <div className="flex flex-col justify-center pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-text-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecipeBased}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isRecipeBased: e.target.checked,
                    })
                  }
                  className="rounded text-patina focus:ring-patina"
                />
                Recipe / Ingredient Based Item
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-text-dark cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded text-patina focus:ring-patina"
                />
                Active (Available in POS)
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="default"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="orange">
              {editingProduct ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
