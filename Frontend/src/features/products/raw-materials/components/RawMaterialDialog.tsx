import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { RawMaterial, CreateRawMaterialPayload } from '@/services/api/rawMaterialsService';

const rawMaterialSchema = z.object({
  code: z.string().min(1, 'Material Code is required'),
  name: z.string().min(1, 'Material Name is required'),
  costPerUnit: z.coerce.number().min(0, 'Cost per unit must be a positive number'),
  reorderLevel: z.coerce.number().min(0, 'Reorder level must be 0 or greater').default(10),
  isActive: z.boolean().default(true),
});

type RawMaterialFormValues = z.infer<typeof rawMaterialSchema>;

interface RawMaterialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRawMaterialPayload) => Promise<void>;
  initialData?: RawMaterial | null;
  loading?: boolean;
}

export const RawMaterialDialog: React.FC<RawMaterialDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RawMaterialFormValues>({
    resolver: zodResolver(rawMaterialSchema),
    defaultValues: {
      code: '',
      name: '',
      costPerUnit: 0,
      reorderLevel: 10,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code || '',
        name: initialData.name || '',
        costPerUnit: initialData.costPerUnit || 0,
        reorderLevel: initialData.reorderLevel || 10,
        isActive: initialData.isActive !== false,
      });
    } else {
      reset({
        code: '',
        name: '',
        costPerUnit: 0,
        reorderLevel: 10,
        isActive: true,
      });
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (data: RawMaterialFormValues) => {
    await onSave(data);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Raw Material' : 'Add New Raw Material'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Material Code <span className="text-red-500">*</span>
          </label>
          <input
            className="input w-full"
            placeholder="e.g. RM-MILK-01"
            disabled={loading}
            {...register('code')}
          />
          {errors.code && (
            <span className="text-xs text-red-500">{errors.code.message}</span>
          )}
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Material Name <span className="text-red-500">*</span>
          </label>
          <input
            className="input w-full"
            placeholder="e.g. Fresh Whole Milk (1L)"
            disabled={loading}
            {...register('name')}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Cost Per Unit (Rs.) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              className="input w-full"
              placeholder="0.00"
              disabled={loading}
              {...register('costPerUnit')}
            />
            {errors.costPerUnit && (
              <span className="text-xs text-red-500">{errors.costPerUnit.message}</span>
            )}
          </div>

          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Reorder Level</label>
            <input
              type="number"
              className="input w-full"
              placeholder="10"
              disabled={loading}
              {...register('reorderLevel')}
            />
            {errors.reorderLevel && (
              <span className="text-xs text-red-500">{errors.reorderLevel.message}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActive"
            disabled={loading}
            className="rounded border-gray-300 text-patina focus:ring-patina"
            {...register('isActive')}
          />
          <label htmlFor="isActive" className="text-xs text-gray-700 font-medium">
            Active Ingredient
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Material' : 'Save Material'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
