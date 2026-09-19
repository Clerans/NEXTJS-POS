import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Customer } from '@/types/customer.types';
import { toast } from 'sonner';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().min(1, 'Mobile number is required'),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface AddCustomerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (cust: Customer) => void;
}

export const AddCustomerDialog: React.FC<AddCustomerDialogProps> = ({
  isOpen,
  onClose,
  onAddCustomer,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      mobile: '',
    },
  });

  const onSubmit = (data: CustomerFormValues) => {
    const newCust: Customer = {
      name: data.name,
      mobile: data.mobile,
      orders: 0,
      spend: 'Rs. 0',
      lastVisit: 'Today',
    };
    onAddCustomer(newCust);
    toast.success('Customer created successfully!');
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Customer">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label>
            Customer Name <span className="req">*</span>
          </label>
          <input
            className="input"
            placeholder="e.g. Amal Jayasuriya"
            {...register('name')}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="field">
          <label>
            Mobile Number <span className="req">*</span>
          </label>
          <input
            className="input"
            placeholder="0765432109"
            {...register('mobile')}
          />
          {errors.mobile && (
            <span className="text-xs text-red-500">{errors.mobile.message}</span>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="orange">
            Create Customer
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
