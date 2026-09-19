import React, { useState, useEffect } from 'react';
import { usePOSStore, PaymentMethodType } from './store/usePOSStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ReceiptDialog } from './components/ReceiptDialog';
import { BaristaKDSModal } from './components/BaristaKDSModal';
import { PosOrderType } from '@/types/pos.types';
import { syncEngine, SyncEngineStatus } from '@/services/offline/syncEngine';
import { customersService, Customer } from '@/services/api/customersService';
import { tablesService, DiningTable } from '@/services/api/tablesService';
import {
  Coffee,
  ShoppingCart,
  Search,
  Sandwich,
  Croissant,
  CupSoda,
  Package,
  WifiOff,
  RefreshCw,
  Wifi,
  User,
  CreditCard,
  Lock,
  LayoutGrid,
} from 'lucide-react';
import { toast } from 'sonner';

export const POSPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [diningTables, setDiningTables] = useState<DiningTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<number | ''>('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [managerPin, setManagerPin] = useState('');
  const [creditErrorMessage, setCreditErrorMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncEngineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    pendingCount: 0,
  });

  const {
    cart,
    products,
    selectedCategory,
    orderType,
    selectedCustomerId,
    customerGroupDiscountRate,
    manualDiscount,
    taxPercentage,
    paymentMethod,
    fetchProducts,
    fetchSettings,
    addToCart,
    updateQty,
    clearCart,
    setSelectedCategory,
    setOrderType,
    setSelectedCustomer,
    setManualDiscount,
    setPaymentMethod,
    checkout,
    openBaristaKds,
  } = usePOSStore();

  const [customerGroups, setCustomerGroups] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchSettings();
    const unsubscribe = syncEngine.subscribe(setSyncStatus);
    customersService.getAll().then((data) => setCustomers(data)).catch(() => {});
    customersService.getGroups().then((data) => setCustomerGroups(data)).catch(() => {});
    tablesService.getAll().then((data) => setDiningTables(data)).catch(() => {});
    return () => unsubscribe();
  }, [fetchProducts, fetchSettings]);

  const displayProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category?.name || 'Beverages',
    price: p.retailPrice,
    icon: p.category?.name?.toLowerCase().includes('bakery') ? 'bread' : 'coffee',
  }));

  const categories = ['All', 'Savory Items', 'Bread', 'Beverages'];

  const filteredProducts = displayProducts.filter((p) => {
    const matchCat =
      selectedCategory === 'All' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const groupDiscount = (subtotal * customerGroupDiscountRate) / 100;
  const totalDiscount = Math.min(subtotal, groupDiscount + manualDiscount);
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const tax = parseFloat(((taxableAmount * taxPercentage) / 100).toFixed(2));
  const total = parseFloat((taxableAmount + tax).toFixed(2));

  const getIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'sandwich':
        return <Sandwich className="w-8 h-8 text-patina-dark" />;
      case 'bread':
        return <Croissant className="w-8 h-8 text-patina-dark" />;
      case 'coffee':
        return <Coffee className="w-8 h-8 text-patina-dark" />;
      case 'cup-soda':
        return <CupSoda className="w-8 h-8 text-patina-dark" />;
      default:
        return <Package className="w-8 h-8 text-patina-dark" />;
    }
  };

  const handleCheckout = async (pin?: string) => {
    if (cart.length === 0) {
      toast.info('Please add items to cart before checkout');
      return;
    }

    if (paymentMethod === 'CREDIT' && !selectedCustomerId) {
      toast.error('Please select a customer for Credit purchase');
      return;
    }

    try {
      const order = await checkout({ managerPin: pin });
      if (order) {
        setShowPinModal(false);
        setManagerPin('');
        setCreditErrorMessage('');

        if (order.id.startsWith('OFFLINE-')) {
          toast.info(`Offline receipt issued (${order.id})`);
        } else {
          toast.success(`Order ${order.id} placed successfully!`);
        }
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || 'Checkout failed';
      if (errorMsg.includes('Credit limit exceeded')) {
        setCreditErrorMessage(errorMsg);
        setShowPinModal(true);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handlePinSubmit = () => {
    if (!managerPin || managerPin.length < 4) {
      toast.error('Please enter a valid 4-digit Manager PIN');
      return;
    }
    handleCheckout(managerPin);
  };

  const selectedCustomerObj = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="space-y-4">
      <div className="page-head-row">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">Point of Sale (POS)</h1>

            {/* Offline Sync Status Badge */}
            {syncStatus.isSyncing ? (
              <Badge variant="orange" className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" /> Syncing ({syncStatus.pendingCount})...
              </Badge>
            ) : !syncStatus.isOnline ? (
              <Badge variant="red" className="flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> Offline ({syncStatus.pendingCount} Queued)
              </Badge>
            ) : syncStatus.pendingCount > 0 ? (
              <Badge
                variant="orange"
                className="flex items-center gap-1 cursor-pointer hover:opacity-80"
                onClick={() => syncEngine.processQueue()}
                title="Click to trigger manual sync"
              >
                <RefreshCw className="w-3 h-3" /> Pending Sync: {syncStatus.pendingCount}
              </Badge>
            ) : (
              <Badge variant="green" className="flex items-center gap-1">
                <Wifi className="w-3 h-3" /> Online
              </Badge>
            )}
          </div>
          <div className="page-sub">Interactive register order building and live checkout</div>
        </div>

        <Button
          variant="orange"
          onClick={openBaristaKds}
          className="btn-orange flex items-center gap-1.5"
        >
          <Coffee className="w-4 h-4" /> Barista KDS Screen
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Columns: Product Catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Chips */}
          <div className="chip-row">
            {categories.map((cat) => (
              <div
                key={cat}
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* Product Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              className="input pl-9"
              placeholder="Search products by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* POS Items Grid */}
          <div className="pos-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="pos-item"
                  onClick={() => {
                    addToCart(p);
                    toast.success(`Added ${p.name} to order`);
                  }}
                >
                  <div className="pi-img">{getIconComponent(p.icon)}</div>
                  <div className="pi-name font-bold text-xs text-textDark">
                    {p.name}
                  </div>
                  <div className="pi-price text-xs text-patina font-bold mt-1">
                    Rs. {p.price.toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-400 py-8">
                No products found
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Active Cart Panel */}
        <div className="card space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <h2 className="font-bold text-sm text-textDark flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-patina" /> Order Cart
            </h2>
            {cart.length > 0 && (
              <button
                className="text-xs text-red-500 font-bold hover:underline"
                onClick={() => {
                  clearCart();
                  toast.info('Cart cleared');
                }}
              >
                Clear
              </button>
            )}
          </div>

          {/* Customer Selection */}
          <div className="field">
            <label className="flex items-center gap-1 font-bold text-xs">
              <User className="w-3.5 h-3.5 text-patina" /> Customer
            </label>
            <select
              className="select w-full"
              value={selectedCustomerId || ''}
              onChange={(e) => {
                const custId = e.target.value ? Number(e.target.value) : undefined;
                const cust = customers.find((c) => c.id === custId);
                const grp = cust ? customerGroups.find((g) => g.id === cust.groupId) : undefined;
                setSelectedCustomer(custId, grp?.discountRate || 0);
              }}
            >
              <option value="">Walk-in Patron (Default)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (Bal: Rs. {c.outstandingBalance || 0} / Limit: Rs. {c.creditLimit || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Order Type Selector */}
          <div className="field">
            <label className="font-bold text-xs">Order Type</label>
            <select
              className="select w-full"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as PosOrderType)}
            >
              <option value="Take Away">Take Away</option>
              <option value="Dine-In">Dine-In</option>
              <option value="Delivery">Delivery</option>
            </select>
          </div>

          {/* Dine-In Dining Table Selection */}
          {orderType === 'Dine-In' && (
            <div className="field bg-patina-light/40 p-2.5 rounded-lg border border-patina/20">
              <label className="flex items-center gap-1.5 font-bold text-xs text-teal-900 mb-1">
                <LayoutGrid className="w-3.5 h-3.5 text-patina" /> Dining Floor Table
              </label>
              <select
                className="select w-full text-xs"
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">-- Select Dining Table --</option>
                {diningTables.map((t) => (
                  <option key={t.id} value={t.id}>
                    Table #{t.tableNumber} ({t.capacity} Seats) — {t.availability}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="field">
            <label className="flex items-center gap-1 font-bold text-xs">
              <CreditCard className="w-3.5 h-3.5 text-patina" /> Payment Method
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['CASH', 'CARD', 'CREDIT'] as PaymentMethodType[]).map((pm) => (
                <button
                  key={pm}
                  type="button"
                  onClick={() => setPaymentMethod(pm)}
                  className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                    paymentMethod === pm
                      ? 'bg-patina-dark text-white border-patina-dark'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pm === 'CASH' ? 'Cash' : pm === 'CARD' ? 'Card' : 'Credit Sale'}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'CREDIT' && selectedCustomerObj && (
            <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-xs space-y-1">
              <div className="font-bold text-orange-900">Credit Account Status:</div>
              <div className="flex justify-between text-orange-800">
                <span>Credit Limit:</span>
                <span className="font-bold">Rs. {(selectedCustomerObj.creditLimit || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-orange-800">
                <span>Current Balance:</span>
                <span className="font-bold">Rs. {(selectedCustomerObj.outstandingBalance || 0).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-border"
                >
                  <div>
                    <div className="font-bold text-xs text-gray-900">{item.name}</div>
                    <div className="text-[11px] text-teal-800 font-semibold">
                      Rs. {item.price}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-6 h-6 rounded bg-gray-200 font-bold flex items-center justify-center text-xs hover:bg-gray-300"
                      onClick={() => updateQty(item.id, -1)}
                    >
                      -
                    </button>
                    <span className="font-bold text-xs w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      className="w-6 h-6 rounded bg-gray-200 font-bold flex items-center justify-center text-xs hover:bg-gray-300"
                      onClick={() => updateQty(item.id, 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state py-6">
                <div className="icon">
                  <ShoppingCart className="w-6 h-6 text-patina" />
                </div>
                <div className="title">Cart is empty</div>
                <div className="text-[11px]">Select products to build order</div>
              </div>
            )}
          </div>

          {/* Totals Summary */}
          <div className="border-t border-border pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-textGray">
              <span>Subtotal:</span>
              <span className="font-bold text-textDark">Rs. {subtotal.toFixed(2)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>
                  Discount {customerGroupDiscountRate > 0 ? `(${customerGroupDiscountRate}% Group)` : ''}:
                </span>
                <span>-Rs. {totalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-textGray">
              <span>Tax ({taxPercentage}%):</span>
              <span className="font-bold text-textDark">Rs. {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm text-textDark pt-2 border-t border-border">
              <span>Total:</span>
              <span className="text-teal-900">Rs. {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Checkout Action */}
          <Button
            variant="orange"
            className="w-full py-3 text-sm font-bold btn-orange"
            onClick={() => handleCheckout()}
          >
            Checkout Order ({paymentMethod})
          </Button>
        </div>
      </div>

      {/* Manager PIN Override Modal for Credit Limit */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-base">
              <Lock className="w-5 h-5" /> Manager Override Required
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-800">
              {creditErrorMessage}
            </div>

            <p className="text-xs text-gray-600">
              Please enter Manager authorization PIN code to override this customer&apos;s credit limit and proceed with billing.
            </p>

            <div className="field">
              <label className="text-xs font-bold">Manager PIN</label>
              <input
                type="password"
                maxLength={8}
                className="input w-full font-mono text-center tracking-widest text-lg"
                placeholder="••••"
                value={managerPin}
                onChange={(e) => setManagerPin(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePinSubmit();
                }}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowPinModal(false);
                  setManagerPin('');
                }}
              >
                Cancel
              </Button>
              <Button variant="orange" size="sm" onClick={handlePinSubmit}>
                Authorize & Override
              </Button>
            </div>
          </div>
        </div>
      )}

      <ReceiptDialog />
      <BaristaKDSModal />
    </div>
  );
};
