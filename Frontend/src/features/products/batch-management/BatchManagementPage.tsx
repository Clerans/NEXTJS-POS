import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Calendar, Plus, Box } from 'lucide-react';
import { toast } from 'sonner';
import { rawMaterialsService, RawMaterialBatch, CreateRawMaterialBatchPayload } from '@/services/api/rawMaterialsService';
import { CreateBatchDialog } from './components/CreateBatchDialog';
import { EmptyState } from '@/components/common/EmptyState';

export const BatchManagementPage: React.FC = () => {
  const [batches, setBatches] = useState<RawMaterialBatch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const data = await rawMaterialsService.getBatches();
      setBatches(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch raw material batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filtered = batches.filter((item) => {
    const matchesSearch =
      item.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      (item.rawMaterialName || '').toLowerCase().includes(search.toLowerCase());
    const matchesBranch = branchFilter === 'All' || (item.warehouseName || '').toLowerCase().includes(branchFilter.toLowerCase());
    return matchesSearch && matchesBranch;
  });

  const handleSaveBatch = async (payload: CreateRawMaterialBatchPayload) => {
    setSaving(true);
    try {
      await rawMaterialsService.createBatch(payload);
      toast.success(`Batch #${payload.batchNumber} recorded successfully`);
      await fetchBatches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record batch');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Batch Inventory Management</h1>
          <div className="page-sub">Track batch numbers, expiration dates, and raw material origins</div>
        </div>
        <Button
          variant="orange"
          onClick={() => setDialogOpen(true)}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Record New Batch
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="filters-grid two">
          <input
            className="input"
            placeholder="Search batch # or raw material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select w-full"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="All">All Warehouses / Branches</option>
            <option value="Main">Main Warehouse</option>
            <option value="Colombo">Colombo Main</option>
            <option value="Malabe">Malabe</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading batch records...
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No Batches Recorded"
            description="No raw material batches have been logged yet."
            icon={<Box className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Batch #</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Raw Material</th>
                <th className="py-3 px-4">Quantity / Cost</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((item) => {
                const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();
                return (
                  <tr key={item.id} className="hover:bg-patina-light/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-900 text-xs"># {item.batchNumber}</td>
                    <td className="py-3 px-4 text-xs font-semibold text-gray-700">
                      {item.warehouseName || `Warehouse #${item.warehouseId}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900 text-xs">
                        {item.rawMaterialName || `Material #${item.rawMaterialId}`}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900 text-xs">{item.quantity} units</div>
                      <div className="text-[11px] text-gray-400">Rs. {Number(item.unitCost || 0).toFixed(2)}/unit</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <div>
                          <div>
                            {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                          </div>
                          {isExpired && <div className="text-[10px] text-red-500 font-bold">Expired</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={isExpired ? 'red' : 'green'}>
                        {isExpired ? 'Expired' : 'Active Batch'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <CreateBatchDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveBatch}
        loading={saving}
      />
    </div>
  );
};
