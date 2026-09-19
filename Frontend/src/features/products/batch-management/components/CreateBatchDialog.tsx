import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { CreateRawMaterialBatchPayload, rawMaterialsService, RawMaterial } from '@/services/api/rawMaterialsService';
import { branchesService, Branch } from '@/services/api/branchesService';

const batchSchema = z.object({
  rawMaterialId: z.coerce.number().min(1, 'Please select a raw material'),
  warehouseId: z.coerce.number().min(1, 'Please select a warehouse/branch'),
  batchNumber: z.string().min(1, 'Batch Number is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitCost: z.coerce.number().min(0, 'Unit cost must be 0 or greater'),
  expiryDate: z.string().optional(),
});

type BatchFormValues = z.infer<typeof batchSchema>;

interface CreateBatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRawMaterialBatchPayload) => Promise<void>;
  loading?: boolean;
}

export const CreateBatchDialog: React.FC<CreateBatchDialogProps> = ({
  isOpen,
  onClose,
  onSave,
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
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      rawMaterialId: 0,
      warehouseId: 0,
      batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
      quantity: 100,
      unitCost: 0,
      expiryDate: '',
    },
  });

  const onSubmit = async (data: BatchFormValues) => {
    await onSave({
      rawMaterialId: data.rawMaterialId,
      warehouseId: data.warehouseId,
      batchNumber: data.batchNumber,
      quantity: data.quantity,
      unitCost: data.unitCost,
      expiryDate: data.expiryDate || undefined,
    });
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Record Raw Material Batch">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Raw Material <span className="text-red-500">*</span>
          </label>
          <select className="select w-full" disabled={loading} {...register('rawMaterialId')}>
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
          <select className="select w-full" disabled={loading} {...register('warehouseId')}>
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
            Batch Number <span className="text-red-500">*</span>
          </label>
          <input
            className="input w-full"
            placeholder="e.g. BATCH-2026-08-01"
            disabled={loading}
            {...register('batchNumber')}
          />
          {errors.batchNumber && (
            <span className="text-xs text-red-500">{errors.batchNumber.message}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="input w-full"
              placeholder="100"
              disabled={loading}
              {...register('quantity')}
            />
            {errors.quantity && (
              <span className="text-xs text-red-500">{errors.quantity.message}</span>
            )}
          </div>

          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Unit Cost (Rs.) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              className="input w-full"
              placeholder="0.00"
              disabled={loading}
              {...register('unitCost')}
            />
            {errors.unitCost && (
              <span className="text-xs text-red-500">{errors.unitCost.message}</span>
            )}
          </div>
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry Date</label>
          <input
            type="date"
            className="input w-full"
            disabled={loading}
            {...register('expiryDate')}
          />
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Recording...' : 'Record Batch'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
