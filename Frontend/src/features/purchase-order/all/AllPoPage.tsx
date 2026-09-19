import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Check, X, Eye, FileText, RefreshCw } from 'lucide-react';
import { poService, PurchaseOrder } from '@/services/api/poService';
import { toast } from 'sonner';

export const AllPoPage: React.FC = () => {
  const [poList, setPoList] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchPOs = async () => {
    setLoading(true);
    try {
      const data = await poService.getAll();
      setPoList(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const handleStatusTransition = async (id: number, status: 'APPROVED' | 'REJECTED' | 'CANCELLED') => {
    setUpdatingId(id);
    try {
      await poService.updateStatus(id, status);
      toast.success(`Purchase Order #${id} status updated to ${status}`);
      fetchPOs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to update status for PO #${id}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="green">Approved</Badge>;
      case 'PENDING_APPROVAL':
        return <Badge variant="orange">Pending Approval</Badge>;
      case 'REJECTED':
        return <Badge variant="red">Rejected</Badge>;
      case 'FULLY_RECEIVED':
      case 'CLOSED':
        return <Badge variant="green">Completed</Badge>;
      case 'PARTIALLY_RECEIVED':
        return <Badge variant="purple">Partially Received</Badge>;
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
          <h1 className="page-title">All Purchase Orders</h1>
          <div className="page-sub">Historical purchase orders, approvals, and vendor order statuses</div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPOs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-textGray text-sm">Loading purchase orders...</div>
        ) : poList.length === 0 ? (
          <div className="p-8 text-center text-textGray text-sm">No Purchase Orders found</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold text-textGray">
                <th className="p-3">PO Number</th>
                <th className="p-3">Date</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {poList.map((po) => {
                const isPending = po.status === 'PENDING_APPROVAL';

                return (
                  <tr key={po.id} className="hover:bg-patina-light/50 transition-colors text-xs">
                    <td className="p-3 font-mono font-bold text-teal-900">{po.poNumber}</td>
                    <td className="p-3 font-medium text-textGray">
                      {new Date(po.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold text-textDark">{po.supplier?.name || 'Vendor'}</td>
                    <td className="p-3 font-bold text-textDark">Rs. {po.totalAmount.toLocaleString()}</td>
                    <td className="p-3">{getStatusBadge(po.status)}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              disabled={updatingId === po.id}
                              onClick={() => handleStatusTransition(po.id, 'APPROVED')}
                              className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center"
                              title="Approve Purchase Order"
                            >
                              <Check className="w-3.5 h-3.5 mr-1" /> Approve
                            </button>
                            <Button
                              size="sm"
                              variant="danger"
                              disabled={updatingId === po.id}
                              onClick={() => handleStatusTransition(po.id, 'REJECTED')}
                              title="Reject Purchase Order"
                            >
                              <X className="w-3.5 h-3.5 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        <button
                          className="act-btn p-1.5 rounded-lg hover:bg-gray-100 text-textGray"
                          title="View PO"
                          onClick={() => toast.info(`Viewing ${po.poNumber}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="act-btn p-1.5 rounded-lg hover:bg-gray-100 text-textGray"
                          title="PDF Export"
                          onClick={() => toast.info(`Exporting ${po.poNumber} PDF`)}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
