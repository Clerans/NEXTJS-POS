import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { CreateVipRoomPayload, UpdateVipRoomPayload, VipRoom } from '@/services/api/vipRoomsService';
import { branchesService, Branch } from '@/services/api/branchesService';

const vipRoomSchema = z.object({
  name: z.string().min(1, 'Room Name is required'),
  hourlyRate: z.coerce.number().min(0, 'Hourly rate must be non-negative'),
  branchId: z.coerce.number().min(1, 'Branch is required'),
  category: z.enum(['Small', 'Medium', 'Large']),
  discountPercentage: z.coerce.number().min(0).max(100, 'Max 100% discount'),
  isActive: z.boolean().default(true),
});

type VipRoomFormValues = z.infer<typeof vipRoomSchema>;

interface AddVipRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateVipRoomPayload | UpdateVipRoomPayload) => Promise<void>;
  initialData?: VipRoom | null;
  loading?: boolean;
}

export const AddVipRoomDialog: React.FC<AddVipRoomDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading = false,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);

  useEffect(() => {
    if (isOpen) {
      branchesService.getAll().then(setBranches).catch(() => {});
    }
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VipRoomFormValues>({
    resolver: zodResolver(vipRoomSchema),
    defaultValues: {
      name: '',
      hourlyRate: 3000,
      branchId: 1,
      category: 'Medium',
      discountPercentage: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        hourlyRate: initialData.hourlyRate || 3000,
        branchId: initialData.branchId || 1,
        category: initialData.category || 'Medium',
        discountPercentage: initialData.discountPercentage || 0,
        isActive: initialData.isActive !== false,
      });
    } else {
      reset({
        name: '',
        hourlyRate: 3000,
        branchId: branches[0]?.id || 1,
        category: 'Medium',
        discountPercentage: 0,
        isActive: true,
      });
    }
  }, [initialData, isOpen, branches, reset]);

  const onSubmit = async (data: VipRoomFormValues) => {
    await onSave({
      branchId: data.branchId,
      name: data.name,
      category: data.category,
      hourlyRate: data.hourlyRate,
      discountPercentage: data.discountPercentage,
      isActive: data.isActive,
    });
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit VIP Room' : 'Add New VIP Room'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Room Name <span className="text-red-500">*</span>
          </label>
          <input
            className="input w-full"
            placeholder="e.g. Executive Suite / VIP Room 1"
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
              Hourly Rate (Rs.) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="input w-full"
              placeholder="3000"
              disabled={loading}
              {...register('hourlyRate')}
            />
            {errors.hourlyRate && (
              <span className="text-xs text-red-500">{errors.hourlyRate.message}</span>
            )}
          </div>

          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Discount (%)</label>
            <input
              type="number"
              className="input w-full"
              placeholder="0"
              disabled={loading}
              {...register('discountPercentage')}
            />
            {errors.discountPercentage && (
              <span className="text-xs text-red-500">{errors.discountPercentage.message}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select className="select w-full" disabled={loading} {...register('branchId')}>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
              {branches.length === 0 && <option value={1}>Main Branch</option>}
            </select>
          </div>

          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
            <select className="select w-full" disabled={loading} {...register('category')}>
              <option value="Small">Small (4-6 Persons)</option>
              <option value="Medium">Medium (8-12 Persons)</option>
              <option value="Large">Large (15+ Persons)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActiveVipRoom"
            disabled={loading}
            className="rounded border-gray-300 text-patina focus:ring-patina"
            {...register('isActive')}
          />
          <label htmlFor="isActiveVipRoom" className="text-xs text-gray-700 font-medium">
            Active VIP Room
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Room' : '+ Create Room'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
