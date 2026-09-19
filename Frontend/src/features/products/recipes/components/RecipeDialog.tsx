import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Recipe, CreateRecipePayload, UpdateRecipePayload } from '@/services/api/recipesService';
import { productsService, Product } from '@/services/api/productsService';
import { rawMaterialsService, RawMaterial } from '@/services/api/rawMaterialsService';

interface RecipeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRecipePayload | UpdateRecipePayload) => Promise<void>;
  initialData?: Recipe | null;
  loading?: boolean;
}

interface IngredientRow {
  rawMaterialId: number;
  quantity: number;
}

export const RecipeDialog: React.FC<RecipeDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);

  const [productId, setProductId] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [yieldQuantity, setYieldQuantity] = useState<number>(1);
  const [instructions, setInstructions] = useState<string>('');
  const [items, setItems] = useState<IngredientRow[]>([
    { rawMaterialId: 0, quantity: 1 },
  ]);

  useEffect(() => {
    if (isOpen) {
      productsService
        .getAll()
        .then((data) => {
          // Filter to recipe-based products if specified, or all products as fallback
          const recipeProds = data.filter((p) => p.isRecipeBased);
          setProducts(recipeProds.length > 0 ? recipeProds : data);
        })
        .catch(() => {});

      rawMaterialsService
        .getAll()
        .then(setRawMaterials)
        .catch(() => {});
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setProductId(initialData.productId || 0);
      setName(initialData.name || '');
      setYieldQuantity(initialData.yieldQuantity || 1);
      setInstructions(initialData.instructions || '');
      if (initialData.items && initialData.items.length > 0) {
        setItems(
          initialData.items.map((it) => ({
            rawMaterialId: it.rawMaterialId,
            quantity: Number(it.quantity) || 1,
          }))
        );
      } else {
        setItems([{ rawMaterialId: 0, quantity: 1 }]);
      }
    } else {
      setProductId(0);
      setName('');
      setYieldQuantity(1);
      setInstructions('');
      setItems([{ rawMaterialId: 0, quantity: 1 }]);
    }
  }, [initialData, isOpen]);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { rawMaterialId: 0, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('A recipe must have at least one raw material ingredient');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof IngredientRow, val: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId) {
      toast.error('Please select a target finished product');
      return;
    }
    if (!name.trim()) {
      toast.error('Please enter a formula/recipe name');
      return;
    }
    if (yieldQuantity <= 0) {
      toast.error('Yield Quantity must be at least 1');
      return;
    }

    const validItems = items.filter((it) => it.rawMaterialId > 0 && it.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Please select at least one valid raw material ingredient with a quantity > 0');
      return;
    }

    const payload = {
      productId,
      name,
      yieldQuantity,
      instructions: instructions || undefined,
      items: validItems.map((it) => ({
        rawMaterialId: it.rawMaterialId,
        quantity: it.quantity,
      })),
    };

    await onSave(payload);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Recipe Formula' : 'Create New Recipe Formula'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Target Finished Product <span className="text-red-500">*</span>
          </label>
          <select
            className="select w-full"
            value={productId}
            onChange={(e) => setProductId(Number(e.target.value))}
            disabled={loading}
          >
            <option value={0}>-- Select Finished Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Recipe Formula Name <span className="text-red-500">*</span>
          </label>
          <input
            className="input w-full"
            placeholder="e.g. Standard 16oz Iced Latte Recipe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="field bg-amber-50/50 p-3 rounded border border-amber-200">
          <label className="block text-xs font-bold text-amber-900 mb-1 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-600" /> Yield Quantity (Batches / Servings Produced) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            className="input w-full bg-white"
            placeholder="1"
            value={yieldQuantity}
            onChange={(e) => setYieldQuantity(Number(e.target.value))}
            disabled={loading}
          />
          <div className="text-[11px] text-amber-700 mt-1.5">
            <strong>Yield Formula Note:</strong> Raw material consumption during batch production scales by{' '}
            <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[10px]">
              (production_qty / yield_quantity) * ingredient_qty
            </code>.
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800">
              Raw Material Ingredients <span className="text-red-500">*</span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="text-xs flex items-center gap-1 py-1 px-2"
              disabled={loading}
            >
              <Plus className="w-3 h-3" /> Add Ingredient
            </Button>
          </div>

          <div className="space-y-2 border rounded-md p-2 bg-gray-50/50">
            {items.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <select
                  className="select flex-1 text-xs"
                  value={row.rawMaterialId}
                  onChange={(e) => handleItemChange(idx, 'rawMaterialId', Number(e.target.value))}
                  disabled={loading}
                >
                  <option value={0}>-- Select Raw Material --</option>
                  {rawMaterials.map((rm) => (
                    <option key={rm.id} value={rm.id}>
                      {rm.name} ({rm.code})
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input w-28 text-xs"
                  placeholder="Qty"
                  value={row.quantity}
                  onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  title="Remove Ingredient"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Preparation Instructions</label>
          <textarea
            className="input w-full h-20 text-xs py-2"
            placeholder="Step-by-step preparation notes..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Saving Recipe...' : initialData ? 'Update Recipe' : 'Save Recipe'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
