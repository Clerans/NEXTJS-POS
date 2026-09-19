import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { UserAccount } from '@/types/user.types';
import { toast } from 'sonner';

const userSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  mobile: z.string().optional(),
  role: z.enum(['Manager', 'Barista', 'Cashier', 'Admin']),
});

type UserFormValues = z.infer<typeof userSchema>;

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: UserAccount) => void;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  isOpen,
  onClose,
  onAddUser,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      mobile: '',
      role: 'Cashier',
    },
  });

  const onSubmit = (data: UserFormValues) => {
    const newUser: UserAccount = {
      username: data.username,
      mobile: data.mobile || 'N/A',
      status: 'Active',
      role: data.role,
      lastLogin: 'Never',
    };
    onAddUser(newUser);
    toast.success('User account created!');
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add System User">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label>
            Username <span className="req">*</span>
          </label>
          <input
            className="input"
            placeholder="e.g. thilini_colombo"
            {...register('username')}
          />
          {errors.username && (
            <span className="text-xs text-red-500">{errors.username.message}</span>
          )}
        </div>

        <div className="field">
          <label>Mobile Number</label>
          <input
            className="input"
            placeholder="0741806597"
            {...register('mobile')}
          />
        </div>

        <div className="field">
          <label>System Role</label>
          <select className="select w-full" {...register('role')}>
            <option value="Manager">Manager</option>
            <option value="Barista">Barista</option>
            <option value="Cashier">Cashier</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="orange">
            Create User
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
