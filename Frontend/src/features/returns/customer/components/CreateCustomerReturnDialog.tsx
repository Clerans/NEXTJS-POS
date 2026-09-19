import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { CreateCustomerReturnPayload, returnsService } from '@/services/api/returnsService';
import { branchesService, Branch } from '@/services/api/branchesService';
import { productsService, Product } from '@/services/api/productsService';

interface CreateCustomerReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReturnItemRow {
  productId: number;
  quantity: number;
  maxPurchasedQuantity: number;
  unitPrice: number;
  reason: string;
}

export const CreateCustomerReturnDialog: React.FC<CreateCustomerReturnDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [orderId, setOrderId] = useState<number>(0);
  const [branchId, setBranchId] = useState<number>(0);
  const [refundMethod, setRefundMethod] = useState<'CASH' | 'STORE_CREDIT' | 'CARD_REFUND'>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const [items, setItems] = useState<ReturnItemRow[]>([
    { productId: 0, quantity: 1, maxPurchasedQuantity: 10, unitPrice: 0, reason: 'Defective item' },
  ]);

  useEffect(() => {
    if (isOpen) {
      branchesService.getAll().then(setBranches).catch(() => {});
      productsService.getAll().then(setProducts).catch(() => {});
    }
  }, [isOpen]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: 0, quantity: 1, maxPurchasedQuantity: 10, unitPrice: 0, reason: 'Defective item' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error('At least one return line item is required');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, pId: number) => {
    const foundProd = products.find((p) => p.id === pId);
    setItems((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        productId: pId,
        unitPrice: foundProd ? Number(foundProd.retailPrice || 0) : 0,
      };
      return next;
    });
  };

  const handleItemChange = (index: number, field: keyof ReturnItemRow, val: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderId || orderId <= 0) {
      toast.error('Please enter a valid Sales Order ID');
      return;
    }
    if (!branchId || branchId <= 0) {
      toast.error('Please select a branch location');
      return;
    }

    // Validation: quantity cannot exceed maxPurchasedQuantity
    for (const item of items) {
      if (!item.productId) {
        toast.error('Please select a returned product for all line items');
        return;
      }
      if (item.quantity <= 0) {
        toast.error('Return quantity must be greater than 0');
        return;
      }
      if (item.quantity > item.maxPurchasedQuantity) {
        toast.error(
          `Cannot return ${item.quantity} units — maximum purchased on referenced order is ${item.maxPurchasedQuantity}`
        );
        return;
      }
    }

    setLoading(true);
    try {
      const payload: CreateCustomerReturnPayload = {
        orderId,
        branchId,
        refundMethod,
        notes: notes || undefined,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          reason: it.reason || 'Customer Return',
        })),
      };

      await returnsService.createCustomerReturn(payload);
      toast.success('Customer return processed successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to process customer return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Process Customer Return & Refund">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Sales Order ID <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="input w-full"
              placeholder="e.g. 101"
              value={orderId || ''}
              onChange={(e) => setOrderId(Number(e.target.value))}
              disabled={loading}
            />
          </div>

          <div className="field">
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Branch Location <span className="text-red-500">*</span>
            </label>
            <select
              className="select w-full"
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              disabled={loading}
            >
              <option value={0}>-- Select Branch --</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Refund Method</label>
          <select
            className="select w-full"
            value={refundMethod}
            onChange={(e) => setRefundMethod(e.target.value as any)}
            disabled={loading}
          >
            <option value="CASH">Cash Refund</option>
            <option value="STORE_CREDIT">Store Credit</option>
            <option value="CARD_REFUND">Card Refund</option>
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-800">
              Returned Items <span className="text-red-500">*</span>
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddItem}
              className="text-xs flex items-center gap-1 py-1 px-2"
              disabled={loading}
            >
              <Plus className="w-3 h-3" /> Add Item
            </Button>
          </div>

          <div className="space-y-3 border rounded-md p-2 bg-gray-50/50">
            {items.map((row, idx) => {
              const isOverLimit = row.quantity > row.maxPurchasedQuantity;
              return (
                <div key={idx} className="space-y-1 bg-white p-2 rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <select
                      className="select flex-1 text-xs"
                      value={row.productId}
                      onChange={(e) => handleProductSelect(idx, Number(e.target.value))}
                      disabled={loading}
                    >
                      <option value={0}>-- Select Returned Product --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.sku})
                        </option>
                      ))}
                    </select>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        className={`input w-full text-xs ${isOverLimit ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="Qty"
                        value={row.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        disabled={loading}
                      />
                    </div>

                    <div className="w-28">
                      <input
                        type="number"
                        step="0.01"
                        className="input w-full text-xs"
                        placeholder="Price (Rs)"
                        value={row.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        disabled={loading}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                      title="Remove Item"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <input
                      className="input flex-1 text-xs py-1"
                      placeholder="Reason for return (e.g. Wrong item, Damaged)"
                      value={row.reason}
                      onChange={(e) => handleItemChange(idx, 'reason', e.target.value)}
                      disabled={loading}
                    />

                    <div className="text-[11px] text-gray-500 whitespace-nowrap">
                      Max Allowed: <strong className="text-gray-800">{row.maxPurchasedQuantity}</strong>
                    </div>
                  </div>

                  {isOverLimit && (
                    <div className="text-[11px] text-red-600 font-bold flex items-center gap-1 pt-0.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> Quantity exceeds purchased limit (Max: {row.maxPurchasedQuantity})
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="field">
          <label className="block text-xs font-semibold text-gray-700 mb-1">Notes / Internal Remarks</label>
          <textarea
            className="input w-full h-16 text-xs py-1.5"
            placeholder="Additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="orange" disabled={loading}>
            {loading ? 'Processing...' : 'Process Customer Return'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
