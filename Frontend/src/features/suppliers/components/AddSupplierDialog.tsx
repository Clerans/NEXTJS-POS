import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Supplier } from '@/types/supplier.types';
import { toast } from 'sonner';

const supplierSchema = z.object({
  name: z.string().min(1, 'Supplier Name is required'),
  contact: z.string().optional(),
  phone: z.string().optional(),
  branch: z.string().default('All Branches'),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface AddSupplierDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSupplier: (sup: Supplier) => void;
}

export const AddSupplierDialog: React.FC<AddSupplierDialogProps> = ({
  isOpen,
  onClose,
  onAddSupplier,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: '',
      contact: '',
      phone: '',
      branch: 'All Branches',
    },
  });

  const onSubmit = (data: SupplierFormValues) => {
    const newSup: Supplier = {
      name: data.name,
      contact: data.contact || 'N/A',
      phone: data.phone || 'N/A',
      branch: data.branch,
      status: 'Active',
    };
    onAddSupplier(newSup);
    toast.success('Supplier added successfully!');
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Supplier">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label>
            Supplier Name <span className="req">*</span>
          </label>
          <input
            className="input"
            placeholder="e.g. Ceylon Coffee Traders"
            {...register('name')}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="field">
          <label>Contact Person</label>
          <input
            className="input"
            placeholder="e.g. Nimal Perera"
            {...register('contact')}
          />
        </div>

        <div className="field">
          <label>Phone Number</label>
          <input
            className="input"
            placeholder="0771234567"
            {...register('phone')}
          />
        </div>

        <div className="field">
          <label>Branch Assignment</label>
          <select className="select w-full" {...register('branch')}>
            <option value="All Branches">All Branches</option>
            <option value="Colombo Main">Colombo Main</option>
            <option value="Malabe">Malabe</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="orange">
            Save Supplier
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
