import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Eye, RefreshCw } from 'lucide-react';
import { grnService, GRN } from '@/services/api/grnService';
import { toast } from 'sonner';

export const AllGrnPage: React.FC = () => {
  const [grnList, setGrnList] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGRNs = async () => {
    setLoading(true);
    try {
      const data = await grnService.getAll();
      setGrnList(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load Goods Received Notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGRNs();
  }, []);

  const getPaymentBadge = (paymentStatus?: string) => {
    switch (paymentStatus) {
      case 'PAID':
        return <Badge variant="green">Paid</Badge>;
      case 'PARTIAL':
        return <Badge variant="purple">Partial</Badge>;
      case 'UNPAID':
      default:
        return <Badge variant="orange">Unpaid</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">All Goods Received Notes</h1>
          <div className="page-sub">Completed inbound delivery logs and shipment receipts</div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchGRNs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-textGray text-sm">Loading Goods Received Notes...</div>
        ) : grnList.length === 0 ? (
          <div className="p-8 text-center text-textGray text-sm">No Goods Received Notes found</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold text-textGray">
                <th className="p-3">GRN Number</th>
                <th className="p-3">Date</th>
                <th className="p-3">Invoice No</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Grand Total</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grnList.map((g) => (
                <tr key={g.id} className="hover:bg-patina-light/50 transition-colors text-xs">
                  <td className="p-3 font-mono font-bold text-teal-900">{g.grnNumber}</td>
                  <td className="p-3 font-medium text-textGray">
                    {new Date(g.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 font-mono text-textDark">{g.invoiceNumber || 'N/A'}</td>
                  <td className="p-3 font-semibold text-textDark">{g.supplierName}</td>
                  <td className="p-3 font-bold text-textDark">
                    Rs. {(g.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-3">{getPaymentBadge(g.paymentStatus)}</td>
                  <td className="p-3 text-right">
                    <button
                      className="act-btn p-1.5 rounded-lg hover:bg-gray-100 text-textGray"
                      title="View GRN"
                      onClick={() => toast.info(`Viewing GRN ${g.grnNumber}`)}
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
    </div>
  );
};
