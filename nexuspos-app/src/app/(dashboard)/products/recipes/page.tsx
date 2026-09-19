"use client";

import React, { useState } from "react";
import { Plus, ChefHat, Eye, SquarePen, Trash2, Search, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Dialog } from "@/components/ui/Dialog";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/lib/db";
import { Recipe } from "@/types";
import { toast } from "sonner";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>(db.recipes);
  const [search, setSearch] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const filtered = recipes.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.productName || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <h1 className="page-title">Recipes & Bill of Materials (BOM)</h1>
          <div className="page-sub">
            Ingredient consumption formulas, portioning, and automated batch cost calculations
          </div>
        </div>
        <Button
          variant="orange"
          onClick={() => toast.info("Opening Recipe Formula Builder...")}
          className="flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Recipe
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header">
          <div className="panel-title">Production Recipes</div>
          <div className="text-xs text-text-gray">Total {recipes.length} standard recipes</div>
        </div>

        <div className="filters-grid two">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-text-gray" />
            <input
              className="input pl-9"
              placeholder="Search recipe or finished product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>
              <th>Recipe Name</th>
              <th>Linked Finished Product</th>
              <th>Yield</th>
              <th>Ingredients Count</th>
              <th>Cost per Yield</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-patina-light/50">
                <td>
                  <div className="font-bold text-xs text-text-dark flex items-center gap-2">
                    <ChefHat className="w-4 h-4 text-patina" /> {r.name}
                  </div>
                </td>
                <td className="font-semibold text-xs text-patina">{r.productName}</td>
                <td className="text-xs text-text-gray font-medium">{r.yieldQuantity} unit(s)</td>
                <td className="text-xs text-text-gray font-medium">
                  {r.items?.length ?? 0} ingredients
                </td>
                <td className="font-bold text-xs text-text-dark">
                  {formatCurrency(r.totalCost ?? 0)}
                </td>
                <td>
                  <Badge variant={r.isActive ? "green" : "gray"}>
                    {r.isActive ? "Active" : "Draft"}
                  </Badge>
                </td>
                <td className="text-right actions-cell">
                  <button
                    className="act-btn"
                    title="View Recipe Formula"
                    onClick={() => {
                      setSelectedRecipe(r);
                      setShowDetail(true);
                    }}
                  >
                    <Eye className="w-4 h-4 text-patina" />
                  </button>
                  <button
                    className="act-btn"
                    title="Edit Recipe"
                    onClick={() => toast.info(`Editing recipe: ${r.name}`)}
                  >
                    <SquarePen className="w-4 h-4 text-text-gray" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recipe Formula Dialog */}
      <Dialog
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={selectedRecipe?.name || "Recipe Specification"}
        description={`Product: ${selectedRecipe?.productName} | Yield: ${selectedRecipe?.yieldQuantity} portion`}
        maxWidth="md"
      >
        {selectedRecipe && (
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-text-dark mb-2">
                Ingredients &amp; Consumption Breakdown:
              </h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-100 text-text-gray text-[10px]">
                    <th className="py-1">Raw Ingredient</th>
                    <th className="py-1 text-center">Required Qty</th>
                    <th className="py-1 text-right">Cost (LKR)</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecipe.items?.map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="py-1.5 font-medium">{item.rawMaterialName}</td>
                      <td className="py-1.5 text-center font-bold">
                        {item.quantity} {item.unitName}
                      </td>
                      <td className="py-1.5 text-right font-bold">
                        {item.unitCost?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-between items-center text-xs font-bold text-text-dark pt-2 border-t border-border mt-2">
                <span>Total Recipe Material Cost:</span>
                <span className="text-patina text-sm">
                  {formatCurrency(selectedRecipe.totalCost || 0)}
                </span>
              </div>
            </div>

            {selectedRecipe.instructions && (
              <div className="p-3 bg-slate-50 rounded-xl border border-border text-xs space-y-1">
                <span className="font-bold text-text-dark flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-patina" /> Preparation Instructions:
                </span>
                <p className="text-text-gray text-[11px] leading-relaxed">
                  {selectedRecipe.instructions}
                </p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}
