import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CreditCard, DollarSign, RefreshCw, X } from 'lucide-react';
import { grnService, GRN } from '@/services/api/grnService';
import { toast } from 'sonner';

export const GrnPaymentPage: React.FC = () => {
  const [grns, setGrns] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected GRN for Payment Modal
  const [selectedGrn, setSelectedGrn] = useState<GRN | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGRNs = async () => {
    setLoading(true);
    try {
      const data = await grnService.getAll();
      setGrns(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load GRN list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGRNs();
  }, []);

  const handleOpenPaymentModal = (grn: GRN) => {
    setSelectedGrn(grn);
    const due = grn.dueBalance !== undefined ? grn.dueBalance : (grn.totalAmount - (grn.paidAmount || 0));
    setPaymentAmount(due > 0 ? due.toString() : '0');
    setPaymentMethod('CASH');
    setReferenceNo('');
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrn) return;

    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid payment amount greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await grnService.recordPayment(selectedGrn.id, {
        amount: amountNum,
        paymentMethod,
        referenceNo: referenceNo.trim() || undefined,
      });

      toast.success(`Payment of Rs. ${amountNum.toLocaleString()} recorded for ${selectedGrn.grnNumber}`);
      setSelectedGrn(null);
      fetchGRNs();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record GRN payment');
    } finally {
      setSubmitting(false);
    }
  };

  const getPaymentBadge = (status?: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="green">Paid</Badge>;
      case 'PARTIAL':
        return <Badge variant="orange">Partial</Badge>;
      default:
        return <Badge variant="red">Unpaid</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="page-title">GRN Payments</h1>
          <div className="page-sub">Vendor accounts payable and shipment settlement tracking</div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchGRNs} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-textGray text-sm">Loading GRN payment ledgers...</div>
        ) : grns.length === 0 ? (
          <div className="p-8 text-center text-textGray text-sm">No Goods Received Notes found</div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-bold text-textGray">
                <th className="p-3">GRN Ref</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Paid Amount</th>
                <th className="p-3">Due Balance</th>
                <th className="p-3">Payment Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grns.map((grn) => {
                const paid = grn.paidAmount || 0;
                const due = grn.dueBalance !== undefined ? grn.dueBalance : Math.max(0, grn.totalAmount - paid);
                const isSettled = due <= 0 || grn.paymentStatus === 'PAID';

                return (
                  <tr key={grn.id} className="hover:bg-patina-light/50 transition-colors text-xs">
                    <td className="p-3 font-mono font-bold text-teal-900">{grn.grnNumber}</td>
                    <td className="p-3 font-semibold text-textDark">{grn.supplierName}</td>
                    <td className="p-3 font-medium text-textGray">{grn.invoiceNumber}</td>
                    <td className="p-3 font-bold text-textDark">Rs. {grn.totalAmount.toLocaleString()}</td>
                    <td className="p-3 font-medium text-emerald-700">Rs. {paid.toLocaleString()}</td>
                    <td className={`p-3 font-bold ${due > 0 ? 'text-red-600' : 'text-textGray'}`}>
                      Rs. {due.toLocaleString()}
                    </td>
                    <td className="p-3">{getPaymentBadge(grn.paymentStatus)}</td>
                    <td className="p-3 text-right">
                      {!isSettled ? (
                        <Button size="sm" variant="orange" onClick={() => handleOpenPaymentModal(grn)}>
                          <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay Now
                        </Button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[11px] uppercase tracking-wide">Settled</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Modal */}
      {selectedGrn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-150">
            <div className="bg-[#004953] px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base flex items-center">
                  <DollarSign className="w-5 h-5 mr-1.5" /> Record Settlement Payment
                </h3>
                <p className="text-xs text-white/80">{selectedGrn.grnNumber} • {selectedGrn.supplierName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedGrn(null)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between text-textGray">
                  <span>GRN Total:</span>
                  <span className="font-bold text-textDark">Rs. {selectedGrn.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-textGray">
                  <span>Already Paid:</span>
                  <span className="font-semibold text-emerald-600">Rs. {(selectedGrn.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-textGray pt-1 border-t border-gray-200">
                  <span className="font-bold">Remaining Due:</span>
                  <span className="font-extrabold text-red-600">
                    Rs. {(selectedGrn.dueBalance !== undefined ? selectedGrn.dueBalance : (selectedGrn.totalAmount - (selectedGrn.paidAmount || 0))).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textDark mb-1">Payment Amount (LKR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full bg-[#F0F5F6] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none border border-transparent focus:border-[#004953]/40"
                  placeholder="Enter amount to pay"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textDark mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#F0F5F6] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none border border-transparent focus:border-[#004953]/40"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CHEQUE">Cheque</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-textDark mb-1">Reference / Cheque # (Optional)</label>
                <input
                  type="text"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full bg-[#F0F5F6] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none border border-transparent focus:border-[#004953]/40"
                  placeholder="e.g. CHQ-88219 or TRF-10294"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-1/2"
                  onClick={() => setSelectedGrn(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 bg-[#004953] hover:bg-[#00363D] text-white"
                >
                  {submitting ? 'Recording...' : 'Submit Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
