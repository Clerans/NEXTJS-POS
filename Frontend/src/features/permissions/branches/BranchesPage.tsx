import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Eye, SquarePen, Trash2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { branchesService, Branch, CreateBranchPayload, UpdateBranchPayload } from '@/services/api/branchesService';
import { BranchDialog } from './components/BranchDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Dialog } from '@/components/ui/Dialog';

export const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [viewBranch, setViewBranch] = useState<Branch | null>(null);
  const [deleteConfirmBranch, setDeleteConfirmBranch] = useState<Branch | null>(null);

  // Check if current logged-in user is ADMINISTRATOR
  const [isAdmin, setIsAdmin] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user') || localStorage.getItem('nexuspos_user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const role = (parsed.role || '').toUpperCase();
        if (role && role !== 'ADMINISTRATOR' && role !== 'ADMIN') {
          setIsAdmin(false);
        }
      }
    } catch {
      // Default to true if unparseable to avoid blocking dev testing
      setIsAdmin(true);
    }
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    try {
      const data = await branchesService.getAll();
      setBranches(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch outlet branches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenAdd = () => {
    if (!isAdmin) {
      toast.error('Only ADMINISTRATOR role can add branches');
      return;
    }
    setSelectedBranch(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    if (!isAdmin) {
      toast.error('Only ADMINISTRATOR role can edit branches');
      return;
    }
    setSelectedBranch(branch);
    setDialogOpen(true);
  };

  const handleSaveBranch = async (formData: CreateBranchPayload | UpdateBranchPayload) => {
    if (!isAdmin) {
      toast.error('Only ADMINISTRATOR role can perform this action');
      return;
    }

    setSaving(true);
    try {
      if (selectedBranch) {
        await branchesService.update(selectedBranch.id, formData);
        toast.success(`Branch '${formData.name}' updated successfully`);
      } else {
        await branchesService.create(formData as CreateBranchPayload);
        toast.success(`Branch '${formData.name}' created successfully`);
      }
      await fetchBranches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save branch');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBranch = async () => {
    if (!deleteConfirmBranch) return;
    if (!isAdmin) {
      toast.error('Only ADMINISTRATOR role can delete branches');
      setDeleteConfirmBranch(null);
      return;
    }

    try {
      await branchesService.delete(deleteConfirmBranch.id);
      toast.success(`Branch '${deleteConfirmBranch.name}' deleted successfully`);
      setDeleteConfirmBranch(null);
      await fetchBranches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete branch');
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Outlet Branches</h1>
          <div className="page-sub">Manage physical stores, warehouses, and locations</div>
        </div>
        {isAdmin && (
          <Button
            variant="orange"
            onClick={handleOpenAdd}
            className="btn-orange flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Branch
          </Button>
        )}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading outlet branches...
          </div>
        ) : branches.length === 0 ? (
          <EmptyState
            title="No Branches Found"
            description="No physical outlets or branches have been created yet."
            icon={<Building2 className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Branch Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-patina-light/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">{b.name}</td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">{b.code}</td>
                  <td className="py-3 px-4 text-gray-600">{b.address || '—'}</td>
                  <td className="py-3 px-4 text-gray-600">{b.phone || '—'}</td>
                  <td className="py-3 px-4">
                    <Badge variant={b.isActive ? 'green' : 'red'}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-gray-600 inline-flex items-center"
                      title="View Details"
                      onClick={() => setViewBranch(b)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          className="act-btn p-1.5 rounded hover:bg-gray-100 text-blue-600 inline-flex items-center"
                          title="Edit Branch"
                          onClick={() => handleOpenEdit(b)}
                        >
                          <SquarePen className="w-4 h-4" />
                        </button>
                        <button
                          className="act-btn p-1.5 rounded hover:bg-gray-100 text-red-600 inline-flex items-center"
                          title="Delete Branch"
                          onClick={() => setDeleteConfirmBranch(b)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Branch Dialog */}
      <BranchDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveBranch}
        initialData={selectedBranch}
        loading={saving}
      />

      {/* View Branch Modal */}
      {viewBranch && (
        <Dialog
          isOpen={!!viewBranch}
          onClose={() => setViewBranch(null)}
          title={`Branch Details — ${viewBranch.name}`}
        >
          <div className="space-y-3 text-sm pt-1">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Branch Name:</span>
              <span className="font-semibold text-gray-900">{viewBranch.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Branch Code:</span>
              <span className="font-mono text-gray-800">{viewBranch.code}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Address:</span>
              <span className="text-gray-800">{viewBranch.address || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Phone:</span>
              <span className="text-gray-800">{viewBranch.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Status:</span>
              <Badge variant={viewBranch.isActive ? 'green' : 'red'}>
                {viewBranch.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex justify-end pt-3">
              <Button variant="outline" onClick={() => setViewBranch(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Confirm Delete Dialog */}
      {deleteConfirmBranch && (
        <Dialog
          isOpen={!!deleteConfirmBranch}
          onClose={() => setDeleteConfirmBranch(null)}
          title="Confirm Delete Branch"
        >
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete branch{' '}
              <strong className="text-gray-900">{deleteConfirmBranch.name}</strong> ({deleteConfirmBranch.code})?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirmBranch(null)}>
                Cancel
              </Button>
              <Button variant="orange" onClick={handleDeleteBranch} className="bg-red-600 hover:bg-red-700">
                Delete Branch
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
