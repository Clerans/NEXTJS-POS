import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Branch } from '@/services/api/branchesService';

const branchSchema = z.object({
  code: z.string().min(1, 'Branch Code is required'),
  name: z.string().min(1, 'Branch Name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BranchFormValues) => Promise<void>;
  initialData?: Branch | null;
  loading?: boolean;
}

export const BranchDialog: React.FC<BranchDialogProps> = ({
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
  } = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      code: '',
      name: '',
      address: '',
      phone: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        code: initialData.code || '',
        name: initialData.name || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        isActive: initialData.isActive !== false,
      });
    } else {
      reset({
        code: '',
        name: '',
        address: '',
        phone: '',
        isActive: true,
      });
    }
  }, [initialData, isOpen, reset]);

  const onSubmit = async (data: BranchFormValues) => {
    await onSave(data);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Branch' : 'Add New Branch'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Branch Code <span className="text-red-500">*</span>
          </label>
          <input
            className="input w-full"
            placeholder="e.g. CMB-01"
            disabled={loading}
            {...register('code')}
          />
          {errors.code && (
            <span className="text-xs text-red-500">{errors.code.message}</span>
          )}
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Branch Name <span className="text-red-500">*</span>
          </label>
          <input
            className="input w-full"
            placeholder="e.g. Colombo Main"
            disabled={loading}
            {...register('name')}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Address</label>
          <input
            className="input w-full"
            placeholder="e.g. 123 Galle Road, Colombo 03"
            disabled={loading}
            {...register('address')}
          />
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
          <input
            className="input w-full"
            placeholder="e.g. 0112345678"
            disabled={loading}
            {...register('phone')}
          />
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
            Active Branch
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Branch' : 'Save Branch'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
