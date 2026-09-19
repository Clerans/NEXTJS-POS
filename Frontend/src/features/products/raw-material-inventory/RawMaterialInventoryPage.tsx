import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eye, Building2, SlidersHorizontal, Box } from 'lucide-react';
import { toast } from 'sonner';
import { rawMaterialsService, RawMaterialInventoryItem, AdjustRawMaterialStockPayload } from '@/services/api/rawMaterialsService';
import { AdjustStockDialog } from './components/AdjustStockDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { Dialog } from '@/components/ui/Dialog';

export const RawMaterialInventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<RawMaterialInventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [adjustItem, setAdjustItem] = useState<RawMaterialInventoryItem | null>(null);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState<boolean>(false);
  const [viewItem, setViewItem] = useState<RawMaterialInventoryItem | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await rawMaterialsService.getInventory();
      setInventory(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch raw material inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = inventory.filter((item) => {
    const name = item.rawMaterialName || '';
    const whName = item.warehouseName || '';
    const matchesSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      whName.toLowerCase().includes(search.toLowerCase());

    let status = 'In Stock';
    if (item.currentStock <= 0) status = 'Out of Stock';
    else if (item.currentStock <= item.reorderLevel) status = 'Low Stock';
    else if (item.currentStock > item.reorderLevel * 3) status = 'Over Stock';

    const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleAdjustStock = async (payload: AdjustRawMaterialStockPayload) => {
    setSaving(true);
    try {
      await rawMaterialsService.adjustStock(payload);
      toast.success('Stock adjusted successfully');
      await fetchInventory();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Raw Material Inventory</h1>
          <div className="page-sub">Track raw material stock quantities across outlets & warehouses</div>
        </div>
        <Button
          variant="orange"
          onClick={() => {
            setAdjustItem(null);
            setAdjustDialogOpen(true);
          }}
          className="btn-orange flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-4 h-4" /> Adjust Stock
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">Inventory Stock Levels</div>
          <div className="text-xs text-textGray">
            Showing {filtered.length} of {inventory.length} inventory items
          </div>
        </div>

        <div className="filters-grid two">
          <input
            className="input"
            placeholder="Search material or warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select w-full"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Over Stock">Over Stock</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading raw material inventory...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Inventory Stock Records"
            description="No stock levels recorded for raw materials yet."
            icon={<Box className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Material Name</th>
                <th className="py-3 px-4">Stock / Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Warehouse Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((item) => {
                let badgeVariant: 'red' | 'green' | 'blue' = 'blue';
                let statusText = 'In Stock';
                if (item.currentStock <= 0) {
                  badgeVariant = 'red';
                  statusText = 'Out of Stock';
                } else if (item.currentStock <= item.reorderLevel) {
                  badgeVariant = 'red';
                  statusText = 'Low Stock';
                } else if (item.currentStock > item.reorderLevel * 3) {
                  badgeVariant = 'green';
                  statusText = 'Over Stock';
                }

                return (
                  <tr key={item.id} className="hover:bg-patina-light/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {item.rawMaterialName || `Material #${item.rawMaterialId}`}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-gray-900">{item.currentStock}</span>{' '}
                        <span className="font-bold text-blue-600">units</span>
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Threshold: {item.reorderLevel}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={badgeVariant}>{statusText}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-gray-800">
                          {item.warehouseName || `Warehouse #${item.warehouseId}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-gray-600 inline-flex items-center"
                        title="View Details"
                        onClick={() => setViewItem(item)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="act-btn p-1.5 rounded hover:bg-gray-100 text-blue-600 inline-flex items-center"
                        title="Adjust Stock"
                        onClick={() => {
                          setAdjustItem(item);
                          setAdjustDialogOpen(true);
                        }}
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <AdjustStockDialog
        isOpen={adjustDialogOpen}
        onClose={() => setAdjustDialogOpen(false)}
        onSave={handleAdjustStock}
        initialItem={adjustItem}
        loading={saving}
      />

      {/* View Item Dialog */}
      {viewItem && (
        <Dialog
          isOpen={!!viewItem}
          onClose={() => setViewItem(null)}
          title={`Raw Material Stock — ${viewItem.rawMaterialName}`}
        >
          <div className="space-y-3 text-sm pt-1">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Material Name:</span>
              <span className="font-semibold text-gray-900">{viewItem.rawMaterialName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Warehouse:</span>
              <span className="text-gray-900">{viewItem.warehouseName || `Warehouse #${viewItem.warehouseId}`}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Current Stock:</span>
              <span className="font-bold text-blue-600">{viewItem.currentStock} units</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500 font-medium">Reorder Threshold:</span>
              <span className="text-gray-800">{viewItem.reorderLevel} units</span>
            </div>
            <div className="flex justify-end pt-3">
              <Button variant="outline" onClick={() => setViewItem(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};
