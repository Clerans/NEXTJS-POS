import React, { useEffect, useState } from 'react';
import { customersService, CustomerGroup } from '@/services/api/customersService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Eye, SquarePen, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { CustomerGroupDialog } from './components/CustomerGroupDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Dialog } from '@/components/ui/Dialog';

export const CustomerGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<CustomerGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<CustomerGroup | null>(null);
  const [viewGroup, setViewGroup] = useState<CustomerGroup | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CustomerGroup | null>(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await customersService.getGroups();
      setGroups(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch customer groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSaveGroup = async (formData: { name: string; discountRate?: number }) => {
    setSaving(true);
    try {
      if (selectedGroup) {
        await customersService.updateGroup(selectedGroup.id, formData);
        toast.success(`Customer Group '${formData.name}' updated successfully`);
      } else {
        await customersService.createGroup(formData);
        toast.success(`Customer Group '${formData.name}' created successfully`);
      }
      await fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save customer group');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteConfirm) return;
    try {
      await customersService.deleteGroup(deleteConfirm.id);
      toast.success(`Customer Group '${deleteConfirm.name}' deleted successfully`);
      setDeleteConfirm(null);
      await fetchGroups();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete customer group');
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Customer Groups</h1>
          <div className="page-sub">Segment patrons for targeted promotions and group discounts</div>
        </div>
        <Button
          variant="orange"
          onClick={() => {
            setSelectedGroup(null);
            setDialogOpen(true);
          }}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Group
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">Customer Group Segments</div>
          <div className="text-xs text-textGray">Total Groups: {groups.length}</div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading customer groups...
          </div>
        ) : groups.length === 0 ? (
          <EmptyState
            title="No Customer Groups Found"
            description="No customer groups or discount tiers have been created yet."
            icon={<Users className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Group Name</th>
                <th className="py-3 px-4">Discount Rate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {groups.map((g) => (
                <tr key={g.id} className="hover:bg-patina-light/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{g.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="purple">
                      {Number(g.discountRate || 0).toFixed(1)}% OFF
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-gray-600 inline-flex items-center"
                      title="View Group Details"
                      onClick={() => setViewGroup(g)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-blue-600 inline-flex items-center"
                      title="Edit Group"
                      onClick={() => {
                        setSelectedGroup(g);
                        setDialogOpen(true);
                      }}
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-red-600 inline-flex items-center"
                      title="Delete Group"
                      onClick={() => setDeleteConfirm(g)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Group Dialog */}
      <CustomerGroupDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveGroup}
        initialData={selectedGroup}
        loading={saving}
      />

      {/* View Group Modal */}
      {viewGroup && (
        <Dialog
          isOpen={!!viewGroup}
          onClose={() => setViewGroup(null)}
          title={`Customer Group — ${viewGroup.name}`}
        >
          <div className="space-y-3 text-sm pt-1">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Group Name:</span>
              <span className="font-semibold text-gray-900">{viewGroup.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Default Discount Rate:</span>
              <Badge variant="purple">
                {Number(viewGroup.discountRate || 0).toFixed(1)}% OFF
              </Badge>
            </div>
            <div className="flex justify-end pt-3">
              <Button variant="outline" onClick={() => setViewGroup(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <Dialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete Customer Group"
        >
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete customer group{' '}
              <strong className="text-gray-900">{deleteConfirm.name}</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="orange" onClick={handleDeleteGroup} className="bg-red-600 hover:bg-red-700">
                Delete Group
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
