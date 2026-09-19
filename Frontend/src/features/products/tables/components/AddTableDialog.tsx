import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { CreateDiningTablePayload, UpdateDiningTablePayload, DiningTable } from '@/services/api/tablesService';
import { branchesService, Branch } from '@/services/api/branchesService';

const tableSchema = z.object({
  tableNumber: z.string().min(1, 'Table number is required'),
  branchId: z.coerce.number().min(1, 'Branch selection is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1').max(50, 'Max 50 capacity'),
  isActive: z.boolean().default(true),
});

type TableFormValues = z.infer<typeof tableSchema>;

interface AddTableDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateDiningTablePayload | UpdateDiningTablePayload) => Promise<void>;
  initialData?: DiningTable | null;
  loading?: boolean;
}

export const AddTableDialog: React.FC<AddTableDialogProps> = ({
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
  } = useForm<TableFormValues>({
    resolver: zodResolver(tableSchema),
    defaultValues: {
      tableNumber: '',
      branchId: 1,
      capacity: 4,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        tableNumber: initialData.tableNumber || '',
        branchId: initialData.branchId || 1,
        capacity: initialData.capacity || 4,
        isActive: initialData.isActive !== false,
      });
    } else {
      reset({
        tableNumber: '',
        branchId: branches[0]?.id || 1,
        capacity: 4,
        isActive: true,
      });
    }
  }, [initialData, isOpen, branches, reset]);

  const onSubmit = async (data: TableFormValues) => {
    const cleanNum = data.tableNumber.replace('#', '').trim();
    await onSave({
      branchId: data.branchId,
      tableNumber: cleanNum,
      capacity: data.capacity,
      isActive: data.isActive,
    });
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Dining Table' : 'Create Dining Table'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Table Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-400 font-bold">#</span>
            <input
              className="input w-full pl-8"
              placeholder="e.g. T001 / Table-01"
              disabled={loading}
              {...register('tableNumber')}
            />
          </div>
          {errors.tableNumber && (
            <span className="text-xs text-red-500">{errors.tableNumber.message}</span>
          )}
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Branch Location <span className="text-red-500">*</span>
          </label>
          <select className="select w-full" disabled={loading} {...register('branchId')}>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code})
              </option>
            ))}
            {branches.length === 0 && <option value={1}>Main Branch</option>}
          </select>
          {errors.branchId && (
            <span className="text-xs text-red-500">{errors.branchId.message}</span>
          )}
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Seating Capacity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className="input w-full"
            placeholder="4"
            disabled={loading}
            {...register('capacity')}
          />
          {errors.capacity && (
            <span className="text-xs text-red-500">{errors.capacity.message}</span>
          )}
          <div className="text-[11px] text-gray-400 mt-1">Number of people the table can seat (1-50)</div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActiveTable"
            disabled={loading}
            className="rounded border-gray-300 text-patina focus:ring-patina"
            {...register('isActive')}
          />
          <label htmlFor="isActiveTable" className="text-xs text-gray-700 font-medium">
            Active Table
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Table' : '+ Create Table'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
