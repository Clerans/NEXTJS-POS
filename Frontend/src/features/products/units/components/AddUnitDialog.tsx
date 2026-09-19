import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Unit } from '@/types/unit.types';
import { productsService } from '@/services/api/productsService';
import { toast } from 'sonner';

const unitSchema = z.object({
  name: z.string().min(1, 'Unit Name is required'),
  abbr: z.string().min(1, 'Abbreviation is required'),
  type: z.enum(['Quantity', 'Weight', 'Volume']),
  status: z.enum(['Active', 'Inactive']),
});

type UnitFormValues = z.infer<typeof unitSchema>;

interface AddUnitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUnit: (unit: Unit) => void;
}

export const AddUnitDialog: React.FC<AddUnitDialogProps> = ({
  isOpen,
  onClose,
  onAddUnit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      name: '',
      abbr: '',
      type: 'Quantity',
      status: 'Active',
    },
  });

  const onSubmit = async (data: UnitFormValues) => {
    try {
      const icon = data.type === 'Quantity' ? '📦' : data.type === 'Weight' ? '⚖️' : '🥤';
      const created = await productsService.createUnit({
        name: data.name,
        abbr: data.abbr,
        type: data.type,
        status: data.status,
        icon,
      });

      onAddUnit(created || {
        id: Date.now(),
        icon,
        name: data.name,
        abbr: data.abbr,
        type: data.type,
        status: data.status,
      });

      toast.success(`Unit "${data.name}" added successfully!`);
      reset();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create unit');
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Unit">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label>
            Unit Name <span className="req">*</span>
          </label>
          <input
            className="input"
            placeholder="e.g. Kilograms"
            {...register('name')}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="field">
          <label>
            Abbreviation <span className="req">*</span>
          </label>
          <input
            className="input"
            placeholder="e.g. kg"
            {...register('abbr')}
          />
          {errors.abbr && (
            <span className="text-xs text-red-500">{errors.abbr.message}</span>
          )}
        </div>

        <div className="field">
          <label>Unit Type</label>
          <select className="select w-full" {...register('type')}>
            <option value="Quantity">Quantity</option>
            <option value="Weight">Weight</option>
            <option value="Volume">Volume</option>
          </select>
        </div>

        <div className="field">
          <label>Status</label>
          <select className="select w-full" {...register('status')}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={isSubmitting}>
            Save Unit
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
