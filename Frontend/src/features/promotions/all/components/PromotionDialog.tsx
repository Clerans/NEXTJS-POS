import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { CreatePromotionPayload } from '@/services/api/promotionsService';

const promoSchema = z.object({
  code: z.string().min(1, 'Promo code is required').toUpperCase(),
  name: z.string().min(1, 'Campaign title is required'),
  type: z.enum(['PERCENTAGE', 'FLAT', 'BUY_X_GET_Y']),
  discountValue: z.coerce.number().min(0, 'Discount value must be 0 or greater'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

type PromoFormValues = z.infer<typeof promoSchema>;

interface PromotionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreatePromotionPayload) => Promise<void>;
  loading?: boolean;
}

export const PromotionDialog: React.FC<PromotionDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  loading = false,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromoFormValues>({
    resolver: zodResolver(promoSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'PERCENTAGE',
      discountValue: 15,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: PromoFormValues) => {
    await onSave(data);
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create New Promotion / Discount Code">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Campaign Title <span className="text-red-500">*</span>
          </label>
          <input
            className="input w-full"
            placeholder="e.g. Weekend Coffee Special 15%"
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
              Promo Code <span className="text-red-500">*</span>
            </label>
            <input
              className="input w-full font-mono uppercase"
              placeholder="e.g. COFFEE15"
              disabled={loading}
              {...register('code')}
            />
            {errors.code && (
              <span className="text-xs text-red-500">{errors.code.message}</span>
            )}
          </div>

          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Discount Type <span className="text-red-500">*</span>
            </label>
            <select className="select w-full" disabled={loading} {...register('type')}>
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FLAT">Flat Amount (Rs)</option>
              <option value="BUY_X_GET_Y">Buy X Get Y Free</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Discount Value <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            className="input w-full"
            placeholder="15"
            disabled={loading}
            {...register('discountValue')}
          />
          {errors.discountValue && (
            <span className="text-xs text-red-500">{errors.discountValue.message}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="input w-full text-xs"
              disabled={loading}
              {...register('startDate')}
            />
            {errors.startDate && (
              <span className="text-xs text-red-500">{errors.startDate.message}</span>
            )}
          </div>

          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="input w-full text-xs"
              disabled={loading}
              {...register('endDate')}
            />
            {errors.endDate && (
              <span className="text-xs text-red-500">{errors.endDate.message}</span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Creating...' : 'Create Promotion'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
