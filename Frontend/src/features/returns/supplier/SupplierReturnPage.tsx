import React, { useEffect, useState } from 'react';
import { returnsService, ReturnRecord } from '@/services/api/returnsService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import { CreateSupplierReturnDialog } from './components/CreateSupplierReturnDialog';
import { EmptyState } from '@/components/common/EmptyState';

export const SupplierReturnPage: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const fetchSupplierReturns = async () => {
    setLoading(true);
    try {
      const data = await returnsService.getAll();
      // Filter supplier returns
      const suppReturns = data.filter((r) => r.type === 'SUPPLIER_RETURN');
      setReturns(suppReturns);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch supplier returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplierReturns();
  }, []);

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Supplier Returns</h1>
          <div className="page-sub">Return damaged or defective raw materials to vendors & issue debit notes</div>
        </div>
        <Button
          variant="orange"
          onClick={() => setDialogOpen(true)}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> New Supplier Return
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">Supplier Debit Return History</div>
          <div className="text-xs text-textGray">Total Returns: {returns.length}</div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading supplier returns...
          </div>
        ) : returns.length === 0 ? (
          <EmptyState
            title="No Supplier Returns"
            description="No raw material supplier returns have been logged yet."
            icon={<Undo2 className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Return ID</th>
                <th className="py-3 px-4">Reference No</th>
                <th className="py-3 px-4">Debit Refund Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {returns.map((item) => (
                <tr key={item.id} className="hover:bg-patina-light/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs font-bold text-patina">
                    {item.returnNo || `SR-${item.id}`}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-700">
                    {item.referenceNo || '—'}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    Rs. {Number(item.totalRefundAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="green">
                      {item.status || 'APPROVED'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateSupplierReturnDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchSupplierReturns}
      />
    </div>
  );
};
