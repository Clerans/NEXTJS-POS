import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StockTransferDialog } from './components/StockTransferDialog';
import { Plus, Check, X, RefreshCw } from 'lucide-react';
import { warehouseService, StockTransfer } from '@/services/api/warehouseService';
import { toast } from 'sonner';

export const ProductsTransferPage: React.FC = () => {
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getAllTransfers();
      setTransfers(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load stock transfers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleComplete = async (id: number, transferNo: string) => {
    setActionId(id);
    try {
      await warehouseService.completeTransfer(id);
      toast.success(`Transfer ${transferNo} completed and credited to destination warehouse`);
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to complete transfer ${transferNo}`);
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (id: number, transferNo: string) => {
    setActionId(id);
    try {
      await warehouseService.cancelTransfer(id);
      toast.success(`Transfer ${transferNo} cancelled and stock returned to source warehouse`);
      fetchTransfers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to cancel transfer ${transferNo}`);
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'RECEIVED':
        return <Badge variant="green">Completed</Badge>;
      case 'IN_TRANSIT':
      case 'DISPATCHED':
      case 'REQUESTED':
        return <Badge variant="orange">In Transit</Badge>;
      case 'CANCELLED':
        return <Badge variant="red">Cancelled</Badge>;
      default:
        return <Badge variant="orange">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Products Transfer</h1>
          <div className="page-sub">Inter-outlet and warehouse stock dispatch tracking</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTransfers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="orange" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Stock Transfer
          </Button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-textGray text-sm">Loading stock transfers...</div>
        ) : transfers.length === 0 ? (
          <div className="p-8 text-center text-textGray text-sm">No stock transfer records found</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold text-textGray">
                <th className="p-3">Transfer ID</th>
                <th className="p-3">From Location</th>
                <th className="p-3">To Destination</th>
                <th className="p-3">Items Count</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers.map((t) => {
                const isInTransit = t.status === 'IN_TRANSIT' || t.status === 'DISPATCHED' || t.status === 'REQUESTED';

                return (
                  <tr key={t.id} className="hover:bg-patina-light/50 transition-colors text-xs">
                    <td className="p-3 font-mono font-bold text-teal-900">{t.transferNo}</td>
                    <td className="p-3 font-semibold text-textDark">{t.sourceWarehouse?.name || 'Source'}</td>
                    <td className="p-3 font-semibold text-textDark">{t.destinationWarehouse?.name || 'Destination'}</td>
                    <td className="p-3 font-medium text-textGray">{t.itemsCount} item(s)</td>
                    <td className="p-3">{getStatusBadge(t.status)}</td>
                    <td className="p-3 text-right">
                      {isInTransit ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={actionId === t.id}
                            onClick={() => handleComplete(t.id, t.transferNo)}
                            className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center"
                            title="Receive & Complete Transfer"
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Receive
                          </button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={actionId === t.id}
                            onClick={() => handleCancel(t.id, t.transferNo)}
                            title="Cancel Transfer & Return Stock"
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Cancel
                          </Button>
                        </div>
                      ) : (
                        <span className="text-textGray font-medium text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <StockTransferDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          fetchTransfers();
        }}
      />
    </div>
  );
};
