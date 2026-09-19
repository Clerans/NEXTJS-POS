import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { CreateSupplierReturnPayload, returnsService } from '@/services/api/returnsService';
import { suppliersService, Supplier } from '@/services/api/suppliersService';
import { branchesService, Branch } from '@/services/api/branchesService';
import { rawMaterialsService, RawMaterial } from '@/services/api/rawMaterialsService';

interface CreateSupplierReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SupplierReturnRow {
  rawMaterialId: number;
  quantity: number;
  maxReceivedQuantity: number;
  unitCost: number;
  reason: string;
}

export const CreateSupplierReturnDialog: React.FC<CreateSupplierReturnDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);

  const [supplierId, setSupplierId] = useState<number>(0);
  const [branchId, setBranchId] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [items, setItems] = useState<SupplierReturnRow[]>([
    { rawMaterialId: 0, quantity: 1, maxReceivedQuantity: 50, unitCost: 0, reason: 'Damaged / Expired on arrival' },
  ]);

  useEffect(() => {
    if (isOpen) {
      suppliersService.getAll().then(setSuppliers).catch(() => {});
      branchesService.getAll().then(setBranches).catch(() => {});
      rawMaterialsService.getAll().then(setRawMaterials).catch(() => {});
    }
  }, [isOpen]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { rawMaterialId: 0, quantity: 1, maxReceivedQuantity: 50, unitCost: 0, reason: 'Damaged / Expired on arrival' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('At least one return line item is required');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMaterialSelect = (index: number, rmId: number) => {
    const foundMat = rawMaterials.find((rm) => rm.id === rmId);
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        rawMaterialId: rmId,
        unitCost: foundMat ? Number(foundMat.costPerUnit || 0) : 0,
      };
      return next;
    });
  };

  const handleItemChange = (index: number, field: keyof SupplierReturnRow, val: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId || supplierId <= 0) {
      toast.error('Please select a supplier');
      return;
    }
    if (!branchId || branchId <= 0) {
      toast.error('Please select a branch location');
      return;
    }

    // Validation: quantity cannot exceed maxReceivedQuantity
    for (const item of items) {
      if (!item.rawMaterialId) {
        toast.error('Please select a raw material for all line items');
        return;
      }
      if (item.quantity <= 0) {
        toast.error('Return quantity must be greater than 0');
        return;
      }
      if (item.quantity > item.maxReceivedQuantity) {
        toast.error(
          `Cannot return ${item.quantity} units — maximum received quantity is ${item.maxReceivedQuantity}`
        );
        return;
      }
    }

    setLoading(true);
    try {
      const payload: CreateSupplierReturnPayload = {
        supplierId,
        branchId,
        notes: notes || undefined,
        items: items.map((it) => ({
          rawMaterialId: it.rawMaterialId,
          quantity: it.quantity,
          unitCost: it.unitCost,
          reason: it.reason || 'Supplier Return',
        })),
      };

      await returnsService.createSupplierReturn(payload);
      toast.success('Supplier debit return note created successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create supplier return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create Supplier Return Note">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              className="select w-full"
              value={supplierId}
              onChange={(e) => setSupplierId(Number(e.target.value))}
              disabled={loading}
            >
              <option value={0}>-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Branch Location <span className="text-red-500">*</span>
            </label>
            <select
              className="select w-full"
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              disabled={loading}
            >
              <option value={0}>-- Select Branch --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800">
              Returned Raw Materials <span className="text-red-500">*</span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="text-xs flex items-center gap-1 py-1 px-2"
              disabled={loading}
            >
              <Plus className="w-3 h-3" /> Add Material
            </Button>
          </div>

          <div className="space-y-3 border rounded-md p-2 bg-gray-50/50">
            {items.map((row, idx) => {
              const isOverLimit = row.quantity > row.maxReceivedQuantity;
              return (
                <div key={idx} className="space-y-1 bg-white p-2 rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <select
                      className="select flex-1 text-xs"
                      value={row.rawMaterialId}
                      onChange={(e) => handleMaterialSelect(idx, Number(e.target.value))}
                      disabled={loading}
                    >
                      <option value={0}>-- Select Raw Material --</option>
                      {rawMaterials.map((rm) => (
                        <option key={rm.id} value={rm.id}>
                          {rm.name} ({rm.code})
                        </option>
                      ))}
                    </select>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        className={`input w-full text-xs ${isOverLimit ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="Qty"
                        value={row.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        disabled={loading}
                      />
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        step="0.01"
                        className="input w-full text-xs"
                        placeholder="Cost (Rs)"
                        value={row.unitCost}
                        onChange={(e) => handleItemChange(idx, 'unitCost', Number(e.target.value))}
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Remove Material"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <input
                      className="input flex-1 text-xs py-1"
                      placeholder="Reason for return (e.g. Expired batch, Quality issue)"
                      value={row.reason}
                      onChange={(e) => handleItemChange(idx, 'reason', e.target.value)}
                      disabled={loading}
                    />

                    <div className="text-[11px] text-gray-500 whitespace-nowrap">
                      Max Received: <strong className="text-gray-800">{row.maxReceivedQuantity}</strong>
                    </div>
                  </div>

                  {isOverLimit && (
                    <div className="text-[11px] text-red-600 font-bold flex items-center gap-1 pt-0.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Quantity exceeds received limit (Max: {row.maxReceivedQuantity})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Debit Memo Reference</label>
          <textarea
            className="input w-full h-16 text-xs py-1.5"
            placeholder="Additional supplier return details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Processing...' : 'Create Supplier Return'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
