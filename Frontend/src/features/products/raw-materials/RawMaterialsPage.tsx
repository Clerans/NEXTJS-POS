import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Eye, SquarePen, Trash2, Box } from 'lucide-react';
import { toast } from 'sonner';
import { rawMaterialsService, RawMaterial, CreateRawMaterialPayload } from '@/services/api/rawMaterialsService';
import { RawMaterialDialog } from './components/RawMaterialDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Dialog } from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';

export const RawMaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selectedMaterial, setSelectedMaterial] = useState<RawMaterial | null>(null);
  const [viewMaterial, setViewMaterial] = useState<RawMaterial | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<RawMaterial | null>(null);

  const fetchRawMaterials = async () => {
    setLoading(true);
    try {
      const data = await rawMaterialsService.getAll();
      setMaterials(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch raw materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRawMaterials();
  }, []);

  const filtered = materials.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    const matchesUnit = unitFilter === 'All' || (item.unitName || '').toLowerCase() === unitFilter.toLowerCase();
    return matchesSearch && matchesUnit;
  });

  const handleSaveMaterial = async (formData: CreateRawMaterialPayload) => {
    setSaving(true);
    try {
      if (selectedMaterial) {
        await rawMaterialsService.update(selectedMaterial.id, formData);
        toast.success(`Raw Material '${formData.name}' updated successfully`);
      } else {
        await rawMaterialsService.create(formData);
        toast.success(`Raw Material '${formData.name}' created successfully`);
      }
      await fetchRawMaterials();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save raw material');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!deleteConfirm) return;
    try {
      await rawMaterialsService.delete(deleteConfirm.id);
      toast.success(`Raw Material '${deleteConfirm.name}' deleted successfully`);
      setDeleteConfirm(null);
      await fetchRawMaterials();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete raw material');
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Raw Materials</h1>
          <div className="page-sub">Catalog of ingredients and raw components</div>
        </div>
        <Button
          variant="orange"
          onClick={() => {
            setSelectedMaterial(null);
            setDialogOpen(true);
          }}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Material
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">Raw Materials List</div>
          <div className="text-xs text-textGray">
            Showing {filtered.length} of {materials.length} raw materials
          </div>
        </div>

        <div className="filters-grid two">
          <input
            className="input"
            placeholder="Search material or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select w-full"
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
          >
            <option value="All">All Units</option>
            <option value="Milliliter">Milliliter</option>

            <option value="Kilograms">Kilograms</option>
            <option value="Grams">Grams</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading raw materials...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Raw Materials Found"
            description="No ingredients or raw materials have been added yet."
            icon={<Box className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Material Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Unit / Reorder</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-patina-light/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-gray-900">{item.name}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">{item.code}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        <Box className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-xs">
                          {item.unitName || 'Units'}
                        </div>
                        <div className="text-[11px] text-gray-400">Reorder: {item.reorderLevel}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    Rs. {Number(item.costPerUnit || 0).toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={item.isActive !== false ? 'green' : 'gray'}>
                      {item.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-gray-600 inline-flex items-center"
                      title="View Details"
                      onClick={() => setViewMaterial(item)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-blue-600 inline-flex items-center"
                      title="Edit Material"
                      onClick={() => {
                        setSelectedMaterial(item);
                        setDialogOpen(true);
                      }}
                    >
                      <SquarePen className="w-4 h-4" />
                    </button>
                    <button
                      className="act-btn p-1.5 rounded hover:bg-gray-100 text-red-600 inline-flex items-center"
                      title="Delete Material"
                      onClick={() => setDeleteConfirm(item)}
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

      {/* Add / Edit Material Dialog */}
      <RawMaterialDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveMaterial}
        initialData={selectedMaterial}
        loading={saving}
      />

      {/* View Material Modal */}
      {viewMaterial && (
        <Dialog
          isOpen={!!viewMaterial}
          onClose={() => setViewMaterial(null)}
          title={`Raw Material Details — ${viewMaterial.name}`}
        >
          <div className="space-y-3 text-sm pt-1">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Material Name:</span>
              <span className="font-semibold text-gray-900">{viewMaterial.name}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Material Code:</span>
              <span className="font-mono text-gray-800">{viewMaterial.code}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Cost Per Unit:</span>
              <span className="font-bold text-gray-900">
                Rs. {Number(viewMaterial.costPerUnit || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Reorder Level:</span>
              <span className="text-gray-800">{viewMaterial.reorderLevel}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Status:</span>
              <Badge variant={viewMaterial.isActive !== false ? 'green' : 'gray'}>
                {viewMaterial.isActive !== false ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex justify-end pt-3">
              <Button variant="outline" onClick={() => setViewMaterial(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <Dialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Confirm Delete Material"
        >
          <div className="space-y-4 pt-1">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete raw material{' '}
              <strong className="text-gray-900">{deleteConfirm.name}</strong> ({deleteConfirm.code})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="orange" onClick={handleDeleteMaterial} className="bg-red-600 hover:bg-red-700">
                Delete Material
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
