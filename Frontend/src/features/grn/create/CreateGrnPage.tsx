import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { poService, PurchaseOrder, POItem } from '@/services/api/poService';
import { grnService } from '@/services/api/grnService';
import { ROUTES } from '@/app/router/routes';

interface GrnLineItemState {
  poItemId: number;
  productId?: number;
  rawMaterialId?: number;
  orderedQuantity: number;
  previouslyReceived: number;
  remainingQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  batchNumber: string;
  expiryDate: string;
}

export const CreateGrnPage: React.FC = () => {
  const navigate = useNavigate();

  const [poList, setPoList] = useState<PurchaseOrder[]>([]);
  const [selectedPoId, setSelectedPoId] = useState<number | ''>('');
  const [selectedPo, setSelectedPo] = useState<PurchaseOrder | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [receivedDate, setReceivedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');

  const [grnItems, setGrnItems] = useState<GrnLineItemState[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPoDetails, setLoadingPoDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchPOs = async () => {
      setLoading(true);
      try {
        const data = await poService.getAll();
        // Filter to approved or partially received purchase orders
        const eligible = data.filter(
          (po) => po.status === 'APPROVED' || po.status === 'PARTIALLY_RECEIVED'
        );
        setPoList(eligible);
        if (eligible.length > 0) {
          setSelectedPoId(eligible[0].id);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load purchase orders');
      } finally {
        setLoading(false);
      }
    };
    fetchPOs();
  }, []);

  useEffect(() => {
    if (!selectedPoId) {
      setSelectedPo(null);
      setGrnItems([]);
      return;
    }

    const loadPoDetails = async () => {
      setLoadingPoDetails(true);
      setErrorMsg(null);
      try {
        const po = await poService.getById(Number(selectedPoId));
        setSelectedPo(po);

        if (po.items) {
          const mappedItems: GrnLineItemState[] = po.items.map((item: POItem) => {
            const prevRec = item.receivedQuantity || 0;
            const remaining = Math.max(0, item.quantity - prevRec);
            return {
              poItemId: item.id,
              productId: item.productId,
              rawMaterialId: item.rawMaterialId,
              orderedQuantity: item.quantity,
              previouslyReceived: prevRec,
              remainingQuantity: remaining,
              receivedQuantity: remaining,
              unitCost: item.unitCost,
              batchNumber: '',
              expiryDate: '',
            };
          });
          setGrnItems(mappedItems);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load PO line items');
      } finally {
        setLoadingPoDetails(false);
      }
    };

    loadPoDetails();
  }, [selectedPoId]);

  const handleReceivedQtyChange = (index: number, val: number) => {
    setErrorMsg(null);
    setGrnItems((prev) => {
      const updated = [...prev];
      const target = updated[index];
      const newQty = val < 0 ? 0 : val;

      updated[index] = {
        ...target,
        receivedQuantity: newQty,
      };
      return updated;
    });
  };

  const handleLineFieldChange = (
    index: number,
    field: 'batchNumber' | 'expiryDate',
    val: string
  ) => {
    setGrnItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: val,
      };
      return updated;
    });
  };

  const calculateGrandTotal = () => {
    return grnItems.reduce((sum, item) => sum + item.receivedQuantity * item.unitCost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedPoId || !selectedPo) {
      setErrorMsg('Please select a valid Purchase Order.');
      return;
    }

    if (!invoiceNumber.trim()) {
      setErrorMsg('Invoice Number is required.');
      return;
    }

    // Hard Business Rule Enforcement: received_quantity <= remaining
    for (const item of grnItems) {
      if (item.receivedQuantity > item.remainingQuantity) {
        const errorText = `Cannot receive ${item.receivedQuantity} units. Maximum remaining allowed is ${item.remainingQuantity} for Line Item #${item.poItemId}.`;
        setErrorMsg(errorText);
        toast.error(errorText);
        return;
      }
    }

    const itemsToReceive = grnItems.filter((i) => i.receivedQuantity > 0);
    if (itemsToReceive.length === 0) {
      setErrorMsg('At least one item line must have a received quantity greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        purchaseOrderId: selectedPo.id,
        supplierId: selectedPo.supplier.id,
        branchId: selectedPo.branchId || 1,
        invoiceNumber,
        notes: notes || undefined,
        items: itemsToReceive.map((i) => ({
          productId: i.productId,
          rawMaterialId: i.rawMaterialId,
          receivedQuantity: i.receivedQuantity,
          unitCost: i.unitCost,
          batchNumber: i.batchNumber || undefined,
          expiryDate: i.expiryDate || undefined,
        })),
      };

      await grnService.create(payload);
      toast.success('Goods Received Note (GRN) created successfully!');
      navigate(ROUTES.GRN_ALL);
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.message || err.response?.data?.error || 'Failed to process GRN receipt';
      setErrorMsg(apiMessage);
      toast.error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="card p-8 text-center text-textGray text-sm">Loading purchase orders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.GRN_ALL)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="page-title">Create Goods Received Note (GRN)</h1>
            <div className="page-sub">Receive inbound stock shipments and record batch details</div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {poList.length === 0 ? (
        <div className="card p-8 text-center space-y-3">
          <div className="text-textGray text-sm">No approved or partially-received Purchase Orders available for GRN creation.</div>
          <Button variant="orange" size="sm" onClick={() => navigate(ROUTES.PO_CREATE)}>
            Create New Purchase Order
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="field">
              <label className="text-xs font-bold text-textDark mb-1 block">
                Purchase Order (PO) <span className="text-red-500">*</span>
              </label>
              <select
                className="select w-full"
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(Number(e.target.value))}
                required
              >
                {poList.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.poNumber} ({po.supplier?.name || 'Supplier'}) — Status: {po.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label className="text-xs font-bold text-textDark mb-1 block">
                Supplier Invoice Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="input w-full"
                placeholder="e.g. INV-88912"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="text-xs font-bold text-textDark mb-1 block">Received Date</label>
              <input
                type="date"
                className="input w-full"
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-sm text-textDark">Inbound Line Items & Quantities</h3>
              {selectedPo && (
                <span className="text-xs font-semibold text-textGray">
                  Vendor: <strong className="text-textDark">{selectedPo.supplier?.name}</strong>
                </span>
              )}
            </div>

            {loadingPoDetails ? (
              <div className="p-6 text-center text-textGray text-xs">Loading line items...</div>
            ) : grnItems.length === 0 ? (
              <div className="p-6 text-center text-textGray text-xs">No items found for this PO.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-left text-xs font-bold text-textGray">
                      <th className="p-2.5">Item Ref</th>
                      <th className="p-2.5 w-24">Ordered</th>
                      <th className="p-2.5 w-24">Prev. Rec</th>
                      <th className="p-2.5 w-24">Remaining</th>
                      <th className="p-2.5 w-32">Receiving Qty</th>
                      <th className="p-2.5 w-28">Unit Cost</th>
                      <th className="p-2.5 w-32">Batch No</th>
                      <th className="p-2.5 w-36">Expiry Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {grnItems.map((item, idx) => {
                      const isOverLimit = item.receivedQuantity > item.remainingQuantity;

                      return (
                        <tr
                          key={idx}
                          className={`text-xs transition-colors ${
                            isOverLimit ? 'bg-red-50/70' : 'hover:bg-gray-50/50'
                          }`}
                        >
                          <td className="p-2.5 font-bold text-textDark">
                            {item.productId ? `Product #${item.productId}` : `Raw Material #${item.rawMaterialId}`}
                          </td>
                          <td className="p-2.5 font-medium text-textGray">{item.orderedQuantity}</td>
                          <td className="p-2.5 font-medium text-textGray">{item.previouslyReceived}</td>
                          <td className="p-2.5 font-bold text-teal-900">{item.remainingQuantity}</td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              max={item.remainingQuantity}
                              className={`input w-full ${isOverLimit ? 'border-red-500 focus:ring-red-500' : ''}`}
                              value={item.receivedQuantity}
                              onChange={(e) => handleReceivedQtyChange(idx, Number(e.target.value))}
                            />
                            {isOverLimit && (
                              <span className="text-[10px] text-red-600 font-bold block mt-0.5">
                                Exceeds remaining ({item.remainingQuantity})
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-medium text-textDark">
                            Rs. {item.unitCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-2.5">
                            <input
                              type="text"
                              className="input w-full text-xs"
                              placeholder="Batch #"
                              value={item.batchNumber}
                              onChange={(e) => handleLineFieldChange(idx, 'batchNumber', e.target.value)}
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="date"
                              className="input w-full text-xs"
                              value={item.expiryDate}
                              onChange={(e) => handleLineFieldChange(idx, 'expiryDate', e.target.value)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="field">
            <label className="text-xs font-bold text-textDark mb-1 block">Notes / Receiving Remarks</label>
            <textarea
              className="input w-full h-16 py-2"
              placeholder="Record shipment condition or notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="text-sm font-bold text-textDark">
              GRN Total Value: <span className="text-teal-900 text-base font-extrabold ml-1">Rs. {calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(ROUTES.GRN_ALL)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="orange" disabled={submitting || grnItems.some(i => i.receivedQuantity > i.remainingQuantity)}>
                <CheckCircle className="w-4 h-4 mr-1.5" />
                {submitting ? 'Processing GRN...' : 'Process GRN Receipt'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
