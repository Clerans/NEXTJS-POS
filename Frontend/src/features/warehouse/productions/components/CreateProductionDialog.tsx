import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { productsService, Product } from '@/services/api/productsService';
import { warehouseService } from '@/services/api/warehouseService';
import { branchesService, Branch } from '@/services/api/branchesService';

interface CreateProductionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProductionDialog: React.FC<CreateProductionDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Branch[]>([]);
  const [loadingMasterData, setLoadingMasterData] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [productId, setProductId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(10);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchMasterData = async () => {
      setLoadingMasterData(true);
      setErrorMsg(null);
      try {
        const [allProds, allBranches] = await Promise.all([
          productsService.getAll(),
          branchesService.getAll().catch(() => []),
        ]);

        const recipeProds = allProds.filter((p) => p.isRecipeBased && p.isActive !== false);
        const targetList = recipeProds.length > 0 ? recipeProds : allProds.filter((p) => p.isActive !== false);
        setProducts(targetList);
        setWarehouses(allBranches);

        if (targetList.length > 0) {
          setProductId(targetList[0].id);
        }
        if (allBranches.length > 0) {
          setWarehouseId(allBranches[0].id);
        } else {
          setWarehouseId(1);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load master production data');
      } finally {
        setLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!productId) {
      setErrorMsg('Please select a product for production.');
      return;
    }

    if (!warehouseId) {
      setErrorMsg('Please select a target warehouse.');
      return;
    }

    if (quantity <= 0) {
      setErrorMsg('Production quantity must be greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      await warehouseService.createProduction({
        productId: Number(productId),
        warehouseId: Number(warehouseId),
        quantity: Number(quantity),
      });

      toast.success('Warehouse Batch Production logged and completed successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      const apiMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to execute production run';
      setErrorMsg(apiMessage);
      toast.error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Log New Batch Production">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="field">
          <label className="text-xs font-bold text-textDark mb-1 block">
            Product to Manufacture <span className="text-red-500">*</span>
          </label>
          {loadingMasterData ? (
            <div className="text-xs text-textGray p-2">Loading products...</div>
          ) : (
            <select
              className="select w-full"
              value={productId}
              onChange={(e) => setProductId(Number(e.target.value))}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) {p.isRecipeBased ? '★ Recipe' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="field">
          <label className="text-xs font-bold text-textDark mb-1 block">
            Target Warehouse / Central Kitchen <span className="text-red-500">*</span>
          </label>
          <select
            className="select w-full"
            value={warehouseId}
            onChange={(e) => setWarehouseId(Number(e.target.value))}
            required
          >
            {warehouses.length > 0 ? (
              warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))
            ) : (
              <option value={1}>Main Central Warehouse</option>
            )}
          </select>
        </div>

        <div className="field">
          <label className="text-xs font-bold text-textDark mb-1 block">
            Production Output Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            step="any"
            className="input w-full"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
          <p className="text-[11px] text-textGray mt-1">
            Raw material ingredients will be yield-scaled and deducted automatically from raw material inventory.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={submitting}>
            {submitting ? 'Executing Production...' : 'Log & Complete Production'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
