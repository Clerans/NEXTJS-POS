import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface StockTransferDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StockTransferDialog: React.FC<StockTransferDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      from: 'Main Warehouse',
      to: 'Colombo Main',
      qty: 100,
    },
  });

  const onSubmit = () => {
    toast.success('Transfer Request Created!');
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Stock Transfer">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label>From Location</label>
          <select className="select w-full" {...register('from')}>
            <option value="Main Warehouse">Main Warehouse</option>
            <option value="Malabe Warehouse">Malabe Warehouse</option>
          </select>
        </div>

        <div className="field">
          <label>To Outlet</label>
          <select className="select w-full" {...register('to')}>
            <option value="Colombo Main">Colombo Main</option>
            <option value="Kandy Branch">Kandy Branch</option>
            <option value="Malabe">Malabe Outlet</option>
          </select>
        </div>

        <div className="field">
          <label>Quantity</label>
          <input type="number" className="input" defaultValue={100} {...register('qty')} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="orange">
            Submit Transfer
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
