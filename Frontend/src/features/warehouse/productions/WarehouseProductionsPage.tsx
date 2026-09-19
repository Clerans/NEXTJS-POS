import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { warehouseService, Production } from '@/services/api/warehouseService';
import { CreateProductionDialog } from './components/CreateProductionDialog';

export const WarehouseProductionsPage: React.FC = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchProductions = async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getProductions();
      setProductions(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load warehouse productions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="green">Completed</Badge>;
      case 'DRAFT':
        return <Badge variant="orange">Draft</Badge>;
      case 'CANCELLED':
        return <Badge variant="red">Cancelled</Badge>;
      default:
        return <Badge variant="green">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">Warehouse Productions</h1>
          <div className="page-sub">Central kitchen batch production logs, recipe yields, and material consumption</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProductions} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="orange" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> New Production Run
          </Button>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-textGray text-sm">Loading warehouse productions...</div>
        ) : productions.length === 0 ? (
          <div className="p-8 text-center text-textGray text-sm">No batch production logs found</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold text-textGray">
                <th className="p-3">Batch Code</th>
                <th className="p-3">Date</th>
                <th className="p-3">Product Manufactured</th>
                <th className="p-3">Yield Qty</th>
                <th className="p-3">Warehouse</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productions.map((p) => (
                <tr key={p.id} className="hover:bg-patina-light/50 transition-colors text-xs">
                  <td className="p-3 font-mono font-bold text-teal-900">{p.productionNo}</td>
                  <td className="p-3 font-medium text-textGray">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-bold text-textDark">{p.productName || `Product #${p.productId}`}</td>
                  <td className="p-3 font-bold text-teal-900">{p.quantity} pcs</td>
                  <td className="p-3 font-semibold text-textDark">{p.warehouseName || `Warehouse #${p.warehouseId}`}</td>
                  <td className="p-3">{getStatusBadge(p.status)}</td>
                  <td className="p-3 text-right">
                    <button
                      className="act-btn p-1.5 rounded-lg hover:bg-gray-100 text-textGray"
                      title="View Production Details"
                      onClick={() => toast.info(`Viewing Batch ${p.productionNo}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateProductionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuccess={fetchProductions}
      />
    </div>
  );
};
