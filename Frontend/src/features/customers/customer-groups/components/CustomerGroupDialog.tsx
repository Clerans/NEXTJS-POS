import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { CustomerGroup } from '@/services/api/customersService';

const groupSchema = z.object({
  name: z.string().min(1, 'Group Name is required'),
  discountRate: z.coerce.number().min(0, 'Discount rate must be 0 or greater').max(100, 'Discount rate cannot exceed 100%').default(0),
});

type GroupFormValues = z.infer<typeof groupSchema>;

interface CustomerGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; discountRate?: number }) => Promise<void>;
  initialData?: CustomerGroup | null;
  loading?: boolean;
}

export const CustomerGroupDialog: React.FC<CustomerGroupDialogProps> = ({
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
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      discountRate: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || '',
        discountRate: Number(initialData.discountRate) || 0,
      });
    } else {
      reset({
        name: '',
        discountRate: 0,
      });
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (data: GroupFormValues) => {
    await onSave(data);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Customer Group' : 'Add New Customer Group'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Group Name <span className="text-red-500">*</span>
          </label>
          <input
            className="input w-full"
            placeholder="e.g. VIP Club / Corporate Partners"
            disabled={loading}
            {...register('name')}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Discount Rate (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            className="input w-full"
            placeholder="e.g. 10.0"
            disabled={loading}
            {...register('discountRate')}
          />
          {errors.discountRate && (
            <span className="text-xs text-red-500">{errors.discountRate.message}</span>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Saving Group...' : initialData ? 'Update Group' : 'Save Group'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
