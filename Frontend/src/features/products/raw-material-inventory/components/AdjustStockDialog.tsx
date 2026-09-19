import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { AdjustRawMaterialStockPayload, rawMaterialsService, RawMaterial, RawMaterialInventoryItem } from '@/services/api/rawMaterialsService';
import { branchesService, Branch } from '@/services/api/branchesService';

const adjustSchema = z.object({
  rawMaterialId: z.coerce.number().min(1, 'Please select a raw material'),
  warehouseId: z.coerce.number().min(1, 'Please select a warehouse/branch'),
  newQuantity: z.coerce.number().min(0, 'Quantity must be 0 or greater'),
  reason: z.string().optional(),
});

type AdjustFormValues = z.infer<typeof adjustSchema>;

interface AdjustStockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AdjustRawMaterialStockPayload) => Promise<void>;
  initialItem?: RawMaterialInventoryItem | null;
  loading?: boolean;
}

export const AdjustStockDialog: React.FC<AdjustStockDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  loading = false,
}) => {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    if (isOpen) {
      rawMaterialsService.getAll().then(setMaterials).catch(() => {});
      branchesService.getAll().then(setBranches).catch(() => {});
    }
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustFormValues>({
    resolver: zodResolver(adjustSchema),
    defaultValues: {
      rawMaterialId: 0,
      warehouseId: 0,
      newQuantity: 0,
      reason: '',
    },
  });

  useEffect(() => {
    if (initialItem) {
      reset({
        rawMaterialId: initialItem.rawMaterialId,
        warehouseId: initialItem.warehouseId,
        newQuantity: initialItem.currentStock,
        reason: 'Manual Stock Audit Adjustment',
      });
    } else {
      reset({
        rawMaterialId: 0,
        warehouseId: 0,
        newQuantity: 0,
        reason: '',
      });
    }
  }, [initialItem, isOpen, reset]);

  const onSubmit = async (data: AdjustFormValues) => {
    await onSave({
      rawMaterialId: data.rawMaterialId,
      warehouseId: data.warehouseId,
      newQuantity: data.newQuantity,
      reason: data.reason || undefined,
    });
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Adjust Raw Material Stock">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Raw Material <span className="text-red-500">*</span>
          </label>
          <select
            className="select w-full"
            disabled={loading || !!initialItem}
            {...register('rawMaterialId')}
          >
            <option value={0}>-- Select Raw Material --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.code})
              </option>
            ))}
          </select>
          {errors.rawMaterialId && (
            <span className="text-xs text-red-500">{errors.rawMaterialId.message}</span>
          )}
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Warehouse / Branch <span className="text-red-500">*</span>
          </label>
          <select
            className="select w-full"
            disabled={loading || !!initialItem}
            {...register('warehouseId')}
          >
            <option value={0}>-- Select Warehouse --</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
          {errors.warehouseId && (
            <span className="text-xs text-red-500">{errors.warehouseId.message}</span>
          )}
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            New Stock Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className="input w-full"
            placeholder="e.g. 250"
            disabled={loading}
            {...register('newQuantity')}
          />
          {errors.newQuantity && (
            <span className="text-xs text-red-500">{errors.newQuantity.message}</span>
          )}
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Adjustment</label>
          <input
            className="input w-full"
            placeholder="e.g. Physical count reconciliation / Damage"
            disabled={loading}
            {...register('reason')}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Adjusting...' : 'Save Stock Adjustment'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
