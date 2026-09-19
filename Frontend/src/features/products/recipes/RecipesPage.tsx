import React, { useState, useEffect } from 'react';
import { recipesService, Recipe, CreateRecipePayload, UpdateRecipePayload } from '@/services/api/recipesService';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Plus, Eye, SquarePen, Trash2, BookOpen, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { RecipeDialog } from './components/RecipeDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Dialog } from '@/components/ui/Dialog';

export const RecipesPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Recipe | null>(null);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      const data = await recipesService.getAll();
      setRecipes(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const filtered = recipes.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.productName || '').toLowerCase().includes(search.toLowerCase()) ||
      String(item.id).includes(search)
  );

  const handleSaveRecipe = async (payload: CreateRecipePayload | UpdateRecipePayload) => {
    setSaving(true);
    try {
      if (selectedRecipe) {
        await recipesService.update(selectedRecipe.id, payload);
        toast.success(`Recipe '${payload.name}' updated successfully`);
      } else {
        await recipesService.create(payload as CreateRecipePayload);
        toast.success(`Recipe '${payload.name}' created successfully`);
      }
      await fetchRecipes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save recipe');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!deleteConfirm) return;
    try {
      await recipesService.delete(deleteConfirm.id);
      toast.success(`Recipe '${deleteConfirm.name}' deleted successfully`);
      setDeleteConfirm(null);
      await fetchRecipes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete recipe');
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Recipes</h1>
          <div className="page-sub">Define ingredient formulas, yield quantities, and product recipes</div>
        </div>
        <Button
          variant="orange"
          onClick={() => {
            setSelectedRecipe(null);
            setDialogOpen(true);
          }}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Recipe
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">Product Recipes List</div>
          <div className="text-xs text-textGray">
            Showing {filtered.length} of {recipes.length} recipes
          </div>
        </div>

        <input
          className="input w-64"
          placeholder="Search recipe formula or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading recipes...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Recipes Found"
            description="No product formulas have been created yet."
            icon={<BookOpen className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Recipe ID</th>
                <th className="py-3 px-4">Formula Name</th>
                <th className="py-3 px-4">Target Product</th>
                <th className="py-3 px-4">Yield Quantity</th>
                <th className="py-3 px-4">Ingredients</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-patina-light/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">REC-{item.id}</td>
                  <td className="py-3 px-4 font-bold text-gray-900">{item.name}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">
                    {item.productName || `Product #${item.productId}`}
                  </td>
                  <td className="py-3 px-4">
                    <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold">
                      <Layers className="w-3.5 h-3.5 text-amber-600" />
                      Yield: {item.yieldQuantity || 1} units
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-gray-700">
                    {(item.items || []).length} items
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={item.isActive !== false ? 'green' : 'gray'}>
                      {item.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-gray-600 inline-flex items-center"
                      title="View Recipe Details"
                      onClick={() => setViewRecipe(item)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-blue-600 inline-flex items-center"
                      title="Edit Recipe"
                      onClick={() => {
                        setSelectedRecipe(item);
                        setDialogOpen(true);
                      }}
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-red-600 inline-flex items-center"
                      title="Delete Recipe"
                      onClick={() => setDeleteConfirm(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Recipe Modal */}
      <RecipeDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveRecipe}
        initialData={selectedRecipe}
        loading={saving}
      />

      {/* View Recipe Details Modal */}
      {viewRecipe && (
        <Dialog
          isOpen={!!viewRecipe}
          onClose={() => setViewRecipe(null)}
          title={`Recipe Details — ${viewRecipe.name}`}
        >
          <div className="space-y-4 text-sm pt-1 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-3 border-b pb-3 text-xs">
              <div>
                <span className="text-gray-500 font-medium block">Formula Name:</span>
                <span className="font-bold text-gray-900 text-sm">{viewRecipe.name}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium block">Target Product:</span>
                <span className="font-semibold text-gray-800">
                  {viewRecipe.productName || `Product #${viewRecipe.productId}`}
                </span>
              </div>
              <div className="col-span-2 bg-amber-50 p-2.5 rounded border border-amber-200">
                <span className="text-amber-900 font-bold block mb-0.5">Yield Quantity:</span>
                <span className="text-amber-900 font-bold text-sm">
                  {viewRecipe.yieldQuantity || 1} units per production batch
                </span>
                <p className="text-[11px] text-amber-700 mt-1">
                  Raw material deduction formula: <code>(production_qty / yield_quantity) * ingredient_qty</code>
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 text-xs mb-2 uppercase tracking-wider">
                Raw Material Ingredients
              </h4>
              <table className="w-full text-xs border border-gray-100 rounded">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b">
                  <tr>
                    <th className="py-2 px-3 text-left">Ingredient Name</th>
                    <th className="py-2 px-3 text-right">Quantity Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(viewRecipe.items || []).map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold text-gray-800">
                        {it.rawMaterialName || `Raw Material #${it.rawMaterialId}`}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-gray-900">
                        {it.quantity} {it.unitName || it.unitAbbr || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {viewRecipe.instructions && (
              <div className="border-t pt-3">
                <h4 className="font-bold text-gray-900 text-xs mb-1 uppercase tracking-wider">
                  Preparation Instructions
                </h4>
                <p className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2.5 rounded border border-gray-100">
                  {viewRecipe.instructions}
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewRecipe(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Dialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete Recipe"
        >
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete recipe formula{' '}
              <strong className="text-gray-900">{deleteConfirm.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="orange" onClick={handleDeleteRecipe} className="bg-red-600 hover:bg-red-700">
                Delete Recipe
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
