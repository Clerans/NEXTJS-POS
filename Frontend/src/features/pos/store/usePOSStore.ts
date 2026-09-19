import { create } from 'zustand';
import { PosCartItem, PosOrderType } from '@/types/pos.types';
import { SaleOrder } from '@/types/sales.types';
import { posService } from '@/services/api/posService';
import { productsService, Product } from '@/services/api/productsService';
import { settingsService } from '@/services/api/settingsService';
import { syncEngine } from '@/services/offline/syncEngine';

export type PaymentMethodType = 'CASH' | 'CARD' | 'CREDIT';

interface POSState {
  cart: PosCartItem[];
  products: Product[];
  selectedCategory: string;
  orderType: PosOrderType;
  selectedCustomerId?: number;
  customerGroupDiscountRate: number;
  manualDiscount: number;
  taxPercentage: number;
  activeBranchId: number;
  paymentMethod: PaymentMethodType;
  salesHistory: SaleOrder[];
  isReceiptOpen: boolean;
  currentReceiptOrder: SaleOrder | null;
  isBaristaKdsOpen: boolean;
  isLoadingProducts: boolean;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  addToCart: (product: { id: number; name: string; price: number }) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
  setSelectedCategory: (cat: string) => void;
  setOrderType: (type: PosOrderType) => void;
  setSelectedCustomer: (id?: number, discountRate?: number) => void;
  setManualDiscount: (discount: number) => void;
  setActiveBranchId: (branchId: number) => void;
  setPaymentMethod: (pm: PaymentMethodType) => void;
  checkout: (options?: { managerPin?: string }) => Promise<SaleOrder | null>;
  closeReceipt: () => void;
  openBaristaKds: () => void;
  closeBaristaKds: () => void;
}

const getInitialBranchId = (): number => {
  try {
    const rawUser = localStorage.getItem('nexuspos_user');
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user.branchId) return Number(user.branchId);
      if (Array.isArray(user.branchIds) && user.branchIds.length > 0) return Number(user.branchIds[0]);
    }
  } catch {}
  return 1;
};

export const usePOSStore = create<POSState>((set, get) => ({
  cart: [],
  products: [],
  selectedCategory: 'All',
  orderType: 'Take Away',
  selectedCustomerId: undefined,
  customerGroupDiscountRate: 0,
  manualDiscount: 0,
  taxPercentage: 0,
  activeBranchId: getInitialBranchId(),
  paymentMethod: 'CASH',
  salesHistory: [],
  isReceiptOpen: false,
  currentReceiptOrder: null,
  isBaristaKdsOpen: false,
  isLoadingProducts: false,

  fetchSettings: async () => {
    try {
      const settings = await settingsService.getSettings();
      if (settings && typeof settings.taxPercentage === 'number') {
        set({ taxPercentage: settings.taxPercentage });
      }
    } catch {}
  },

  fetchProducts: async () => {
    set({ isLoadingProducts: true });
    try {
      const data = await productsService.getAll();
      set({ products: data, isLoadingProducts: false });
    } catch {
      set({ isLoadingProducts: false });
    }
  },

  addToCart: (product) => {
    const { cart } = get();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      set({
        cart: cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        ),
      });
    } else {
      set({
        cart: [...cart, { id: product.id, name: product.name, price: product.price, qty: 1 }],
      });
    }
  },

  updateQty: (id, delta) => {
    const { cart } = get();
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : null;
        }
        return item;
      })
      .filter((item): item is PosCartItem => item !== null);

    set({ cart: updated });
  },

  clearCart: () => set({ cart: [], manualDiscount: 0 }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setOrderType: (orderType) => set({ orderType }),
  setSelectedCustomer: (selectedCustomerId, discountRate = 0) =>
    set({ selectedCustomerId, customerGroupDiscountRate: discountRate }),
  setManualDiscount: (manualDiscount) => set({ manualDiscount: Math.max(0, manualDiscount) }),
  setActiveBranchId: (activeBranchId) => set({ activeBranchId }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),

  checkout: async (options) => {
    const {
      cart,
      orderType,
      paymentMethod,
      selectedCustomerId,
      customerGroupDiscountRate,
      manualDiscount,
      taxPercentage,
      activeBranchId,
      salesHistory,
    } = get();

    if (cart.length === 0) return null;

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const groupDiscount = (subtotal * customerGroupDiscountRate) / 100;
    const discountAmount = Math.min(subtotal, groupDiscount + manualDiscount);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = parseFloat(((taxableAmount * taxPercentage) / 100).toFixed(2));
    const total = parseFloat((taxableAmount + taxAmount).toFixed(2));

    const posOrderType: 'TAKE_AWAY' | 'DINE_IN' | 'DELIVERY' =
      orderType === 'Take Away' ? 'TAKE_AWAY' : orderType === 'Dine-In' ? 'DINE_IN' : 'DELIVERY';

    const orderPayload = {
      branchId: activeBranchId,
      customerId: selectedCustomerId,
      orderType: posOrderType,
      items: cart.map((c) => ({
        productId: c.id,
        quantity: c.qty,
        unitPrice: c.price,
      })),
      discountAmount,
      taxAmount,
      paymentMethod,
      amountPaid: paymentMethod === 'CREDIT' ? 0 : total,
      managerPin: options?.managerPin,
    };

    const status = syncEngine.getStatus();

    if (!status.isOnline) {
      const record = await syncEngine.enqueueOrder(orderPayload);
      const newOrder: SaleOrder = {
        id: record.offline_ref,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        customer: selectedCustomerId ? `Customer #${selectedCustomerId}` : 'Walk-in Patron (Offline)',
        type: orderType,
        total,
        status: 'Completed',
        items: cart.map((c) => `${c.name} x${c.qty}`),
      };

      set({
        salesHistory: [newOrder, ...salesHistory],
        cart: [],
        manualDiscount: 0,
        isReceiptOpen: true,
        currentReceiptOrder: newOrder,
      });

      return newOrder;
    }

    try {
      const apiRes = await posService.processOrder(orderPayload);

      const newOrder: SaleOrder = {
        id: apiRes.orderNo || `ORD-${apiRes.orderId}`,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        customer: selectedCustomerId ? `Customer #${selectedCustomerId}` : 'Walk-in Patron',
        type: orderType,
        total,
        status: 'Completed',
        items: cart.map((c) => `${c.name} x${c.qty}`),
      };

      set({
        salesHistory: [newOrder, ...salesHistory],
        cart: [],
        manualDiscount: 0,
        isReceiptOpen: true,
        currentReceiptOrder: newOrder,
      });

      return newOrder;
    } catch (err: any) {
      if (err.response) {
        throw err;
      }

      const record = await syncEngine.enqueueOrder(orderPayload);

      const newOrder: SaleOrder = {
        id: record.offline_ref,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
        customer: selectedCustomerId ? `Customer #${selectedCustomerId}` : 'Walk-in Patron (Offline Queued)',
        type: orderType,
        total,
        status: 'Completed',
        items: cart.map((c) => `${c.name} x${c.qty}`),
      };

      set({
        salesHistory: [newOrder, ...salesHistory],
        cart: [],
        manualDiscount: 0,
        isReceiptOpen: true,
        currentReceiptOrder: newOrder,
      });

      return newOrder;
    }
  },

  closeReceipt: () => set({ isReceiptOpen: false, currentReceiptOrder: null }),
  openBaristaKds: () => set({ isBaristaKdsOpen: true }),
  closeBaristaKds: () => set({ isBaristaKdsOpen: false }),
}));
