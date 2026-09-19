import React, { useEffect, useState } from 'react';
import { returnsService, ReturnRecord } from '@/services/api/returnsService';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { CreateCustomerReturnDialog } from './components/CreateCustomerReturnDialog';
import { EmptyState } from '@/components/common/EmptyState';

export const CustomerReturnPage: React.FC = () => {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const fetchCustomerReturns = async () => {
    setLoading(true);
    try {
      const data = await returnsService.getAll();
      // Filter customer returns
      const custReturns = data.filter((r) => r.type === 'CUSTOMER_RETURN' || !r.type);
      setReturns(custReturns.length > 0 ? custReturns : data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch customer returns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerReturns();
  }, []);

  return (
    <div className="space-y-4">
      <div className="page-head-row flex items-center justify-between">
        <div>
          <h1 className="page-title">Customer Returns</h1>
          <div className="page-sub">Process customer order refunds and item exchanges</div>
        </div>
        <Button
          variant="orange"
          onClick={() => setDialogOpen(true)}
          className="btn-orange flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Process Return
        </Button>
      </div>

      <div className="card space-y-4">
        <div className="panel-header flex items-center justify-between">
          <div className="panel-title font-bold text-gray-900">Customer Returns History</div>
          <div className="text-xs text-textGray">Total Returns: {returns.length}</div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-textGray font-medium text-xs">
            Loading customer returns...
          </div>
        ) : returns.length === 0 ? (
          <EmptyState
            title="No Customer Returns"
            description="No customer returns or refunds have been processed yet."
            icon={<RotateCcw className="w-8 h-8 text-patina" />}
          />
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left text-xs text-gray-600 uppercase tracking-wider border-b border-gray-100">
                <th className="py-3 px-4">Return ID</th>
                <th className="py-3 px-4">Reference No</th>
                <th className="py-3 px-4">Total Refund</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {returns.map((item) => (
                <tr key={item.id} className="hover:bg-patina-light/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs font-bold text-patina">
                    {item.returnNo || `CR-${item.id}`}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-700">
                    {item.referenceNo || '—'}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    Rs. {Number(item.totalRefundAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="green">
                      {item.status || 'PROCESSED'}
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

      <CreateCustomerReturnDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={fetchCustomerReturns}
      />
    </div>
  );
};
