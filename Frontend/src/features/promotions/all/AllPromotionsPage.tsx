import React, { useEffect, useState } from 'react';
import { promotionsService, Promotion, CreatePromotionPayload } from '@/services/api/promotionsService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Tag, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PromotionDialog } from './components/PromotionDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Dialog } from '@/components/ui/Dialog';

export const AllPromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Promotion | null>(null);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const data = await promotionsService.getAll();
      setPromotions(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch promotions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCreatePromotion = async (payload: CreatePromotionPayload) => {
    setSaving(true);
    try {
      await promotionsService.create(payload);
      toast.success(`Promotion '${payload.name}' created successfully`);
      await fetchPromotions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (promo: Promotion) => {
    const newStatus = promo.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await promotionsService.toggleStatus(promo.id, newStatus);
      toast.success(`Promotion '${promo.name}' is now ${newStatus}`);
      await fetchPromotions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update promotion status');
    }
  };

  const handleDeletePromotion = async () => {
    if (!deleteConfirm) return;
    try {
      await promotionsService.delete(deleteConfirm.id);
      toast.success(`Promotion '${deleteConfirm.name}' deleted successfully`);
      setDeleteConfirm(null);
      await fetchPromotions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete promotion');
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">All Promotions</h1>
          <div className="page-sub">Manage discount codes, campaign offers, and special pricing</div>
        </div>
        <Button
          variant="orange"
          onClick={() => setDialogOpen(true)}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Promo
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">Active & Past Promotions</div>
          <div className="text-xs text-textGray">Total Campaigns: {promotions.length}</div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading promotional campaigns...
          </div>
        ) : promotions.length === 0 ? (
          <EmptyState
            title="No Promotions Found"
            description="No promotional offers or discount codes have been created yet."
            icon={<Tag className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Campaign Title</th>
                <th className="py-3 px-4">Promo Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Validity Period</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {promotions.map((p) => {
                const isActive = p.status === 'ACTIVE';
                const isDateValid = !p.endDate || new Date(p.endDate) >= new Date();
                return (
                  <tr key={p.id} className="hover:bg-patina-light/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">{p.name}</td>
                    <td className="py-3 px-4 font-mono text-xs text-patina font-bold">{p.code}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">
                      {p.type === 'PERCENTAGE'
                        ? `${p.discountValue}% OFF`
                        : p.type === 'FLAT' || p.type === 'FIXED_AMOUNT'
                        ? `Rs. ${p.discountValue} OFF`
                        : `${p.discountValue} Promo`}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {p.startDate ? new Date(p.startDate).toLocaleDateString() : ''} —{' '}
                      {p.endDate ? new Date(p.endDate).toLocaleDateString() : ''}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={isActive && isDateValid ? 'green' : 'gray'}>
                        {isActive ? (isDateValid ? 'Active' : 'Expired') : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-blue-600 inline-flex items-center"
                        title={isActive ? 'Deactivate Promo' : 'Activate Promo'}
                        onClick={() => handleToggleStatus(p)}
                      >
                        {isActive ? <ToggleRight className="w-5 h-5 text-teal-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                      </button>
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-red-600 inline-flex items-center"
                        title="Delete Promotion"
                        onClick={() => setDeleteConfirm(p)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <PromotionDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleCreatePromotion}
        loading={saving}
      />

      {/* Confirm Delete Modal */}
      {deleteConfirm && (
        <Dialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete Promotion"
        >
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete promotion{' '}
              <strong className="text-gray-900">{deleteConfirm.name}</strong> ({deleteConfirm.code})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="orange" onClick={handleDeletePromotion} className="bg-red-600 hover:bg-red-700">
                Delete Promotion
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
