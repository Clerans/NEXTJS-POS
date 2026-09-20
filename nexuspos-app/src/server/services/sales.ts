import { db } from "@/lib/db";
import { PosOrder, CartItem, PaymentMethod, OrderType } from "@/types";
import { recordStockMovement } from "./inventory";

export interface CheckoutRequest {
  branchId: number;
  orderType: OrderType;
  customerId?: number;
  tableId?: number;
  items: CartItem[];
  manualDiscount?: number;
  paymentMethod: PaymentMethod;
  tenderedAmount?: number;
  managerPinOverride?: boolean;
}

export interface CheckoutResult {
  success: boolean;
  order: PosOrder;
  receiptNumber: string;
}

/**
 * Server-side transactional checkout processor
 */
export async function processSalesCheckout(
  req: CheckoutRequest,
  userId: number,
  cashierName: string
): Promise<CheckoutResult> {
  if (!req.items || req.items.length === 0) {
    throw new Error("Cannot checkout an empty cart.");
  }

  const branch = db.branches.find((b) => b.id === req.branchId) || db.branches[0];
  const customer = req.customerId ? db.customers.find((c) => c.id === req.customerId) : undefined;
  const table = req.tableId ? db.tables.find((t) => t.id === req.tableId) : undefined;

  // 1. Recalculate and verify line items against server product catalog
  let subtotal = 0;
  const verifiedItems: CartItem[] = [];

  for (const item of req.items) {
    const serverProduct = db.products.find((p) => p.id === item.id);
    if (!serverProduct) {
      throw new Error(`Product with ID ${item.id} (${item.name}) does not exist.`);
    }

    const price = serverProduct.retailPrice;
    const lineTotal = price * item.qty;
    subtotal += lineTotal;

    verifiedItems.push({
      ...item,
      price,
      name: serverProduct.name,
      sku: serverProduct.sku,
    });
  }

  // 2. Calculate Discounts
  const customerDiscountRate = customer?.discountRate || 0;
  const customerDiscountAmount = (subtotal * customerDiscountRate) / 100;
  const manualDiscount = req.manualDiscount || 0;
  const totalDiscount = Math.min(subtotal, customerDiscountAmount + manualDiscount);

  const discountedSubtotal = subtotal - totalDiscount;

  // 3. Taxes & Service Charges from System Settings
  const taxRate = db.settings.taxRate || 0; // e.g. 0% or configured VAT
  const serviceChargeRate = req.orderType === "DINE_IN" ? (db.settings.serviceChargeRate || 0) : 0;

  const taxAmount = (discountedSubtotal * taxRate) / 100;
  const serviceCharge = (discountedSubtotal * serviceChargeRate) / 100;
  const grandTotal = Math.round((discountedSubtotal + taxAmount + serviceCharge) * 100) / 100;

  // 4. Payment & Change Verification
  const tendered = req.tenderedAmount !== undefined ? req.tenderedAmount : grandTotal;
  if (req.paymentMethod === "CASH" && tendered < grandTotal) {
    throw new Error(`Insufficient cash tendered. Total is Rs. ${grandTotal.toFixed(2)}, but received Rs. ${tendered.toFixed(2)}.`);
  }

  const changeDue = req.paymentMethod === "CASH" ? Math.max(0, tendered - grandTotal) : 0;

  // 5. Generate unique Order ID
  const orderId = db.generateOrderId();

  // 6. Create Order Entity
  const newOrder: PosOrder = {
    id: orderId,
    orderNo: orderId,
    branchId: branch.id,
    branchName: branch.name,
    cashierName: cashierName || "NEXUS Cashier",
    customerId: customer?.id,
    customerName: customer ? customer.name : "Walk-in Customer",
    tableId: table?.id,
    tableName: table ? table.name : undefined,
    orderType: req.orderType,
    items: verifiedItems,
    subtotal,
    discountAmount: totalDiscount,
    taxAmount,
    serviceCharge,
    totalAmount: grandTotal,
    paymentMethod: req.paymentMethod,
    amountPaid: req.paymentMethod === "CASH" ? tendered : grandTotal,
    changeGiven: changeDue,
    status: "COMPLETED",
    kdsStatus: "RECEIVED",
    createdAt: new Date().toISOString(),
  };

  // 7. Atomic In-Memory / Database Commit
  db.orders.unshift(newOrder);

  // 8. Deduct Inventory / Recipes in Ledger
  for (const item of verifiedItems) {
    recordStockMovement({
      branchId: branch.id,
      productId: item.id,
      movementType: "SALE",
      quantity: -item.qty,
      referenceType: "SALE",
      referenceId: orderId,
      userId,
      notes: `POS Sale Order ${orderId}`,
    });
  }

  // 9. Update Customer Credit Balance if Credit sale
  if (req.paymentMethod === "CREDIT" && customer) {
    customer.outstandingBalance = (customer.outstandingBalance || 0) + grandTotal;
  }

  return {
    success: true,
    order: newOrder,
    receiptNumber: orderId,
  };
}
