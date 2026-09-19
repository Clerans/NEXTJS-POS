import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { poService } from '@/services/api/poService';
import { suppliersService, Supplier } from '@/services/api/suppliersService';
import { productsService, Product } from '@/services/api/productsService';
import { branchesService, Branch } from '@/services/api/branchesService';
import { ROUTES } from '@/app/router/routes';

interface PoItemRow {
  productId: number;
  quantity: number;
  unitCost: number;
}

export const CreatePoPage: React.FC = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [branchId, setBranchId] = useState<number | ''>('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [items, setItems] = useState<PoItemRow[]>([
    { productId: 0, quantity: 10, unitCost: 0 },
  ]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [supData, prodData, branchData] = await Promise.all([
          suppliersService.getAll(),
          productsService.getAll(),
          branchesService.getAll().catch(() => []),
        ]);
        setSuppliers(supData);
        setProducts(prodData);
        setBranches(branchData);
        if (supData.length > 0) setSupplierId(supData[0].id);
        if (branchData.length > 0) setBranchId(branchData[0].id);
        else setBranchId(1);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load master data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddItem = () => {
    setItems((prev) => [...prev, { productId: 0, quantity: 1, unitCost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.error('Purchase Order must contain at least one item');
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, selectedProdId: number) => {
    const matched = products.find((p) => p.id === selectedProdId);
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: selectedProdId,
        unitCost: matched ? Number(matched.costPrice) || 0 : 0,
      };
      return updated;
    });
  };

  const handleItemChange = (index: number, field: 'quantity' | 'unitCost', value: number) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value < 0 ? 0 : value,
      };
      return updated;
    });
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!supplierId) {
      setErrorMsg('Please select a supplier.');
      return;
    }

    if (!branchId) {
      setErrorMsg('Please select a destination outlet / branch.');
      return;
    }

    const invalidItem = items.find((i) => !i.productId || i.quantity <= 0);
    if (invalidItem) {
      setErrorMsg('All line items must have a valid product selected and quantity greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplierId: Number(supplierId),
        branchId: Number(branchId),
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        notes: notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitCost: i.unitCost,
        })),
      };

      await poService.create(payload);
      toast.success('Purchase Order created successfully!');
      navigate(ROUTES.PO_ALL);
    } catch (err: any) {
      const apiMessage =
        err.response?.data?.message || err.response?.data?.error || 'Failed to create Purchase Order';
      setErrorMsg(apiMessage);
      toast.error(apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="card p-8 text-center text-textGray text-sm">Loading PO creation data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.PO_ALL)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="page-title">Create Purchase Order</h1>
            <div className="page-sub">Generate PO for vendors and raw material suppliers</div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="field">
            <label className="text-xs font-bold text-textDark mb-1 block">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              className="select w-full"
              value={supplierId}
              onChange={(e) => setSupplierId(Number(e.target.value))}
              required
            >
              <option value="">Select Supplier</option>
              {suppliers.map((sup) => (
                <option key={sup.id} value={sup.id}>
                  {sup.name} ({sup.code})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="text-xs font-bold text-textDark mb-1 block">
              Destination Outlet / Branch <span className="text-red-500">*</span>
            </label>
            <select
              className="select w-full"
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              required
            >
              <option value="">Select Destination Branch</option>
              {branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))
              ) : (
                <option value={1}>Main Outlet (Branch #1)</option>
              )}
            </select>
          </div>

          <div className="field">
            <label className="text-xs font-bold text-textDark mb-1 block">Expected Delivery Date</label>
            <input
              type="date"
              className="input w-full"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-sm text-textDark">PO Line Items</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Line Item
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs font-bold text-textGray">
                  <th className="p-2.5">Product / Item</th>
                  <th className="p-2.5 w-32">Order Qty</th>
                  <th className="p-2.5 w-40">Unit Cost (LKR)</th>
                  <th className="p-2.5 w-40">Total (LKR)</th>
                  <th className="p-2.5 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const lineTotal = item.quantity * item.unitCost;
                  return (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-2">
                        <select
                          className="select w-full"
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, Number(e.target.value))}
                          required
                        >
                          <option value={0}>Select Product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          className="input w-full"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                          required
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="input w-full"
                          value={item.unitCost}
                          onChange={(e) => handleItemChange(idx, 'unitCost', Number(e.target.value))}
                          required
                        />
                      </td>
                      <td className="p-2 font-bold text-textDark text-xs">
                        Rs. {lineTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="field">
          <label className="text-xs font-bold text-textDark mb-1 block">Notes / Special Instructions</label>
          <textarea
            className="input w-full h-16 py-2"
            placeholder="Add any delivery or vendor instructions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-border">
          <div className="text-sm font-bold text-textDark">
            Grand Total: <span className="text-teal-900 text-base font-extrabold ml-1">Rs. {calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(ROUTES.PO_ALL)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="orange" disabled={submitting}>
              {submitting ? 'Submitting PO...' : 'Submit Purchase Order'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
