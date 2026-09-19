export type UserRole =
  | "ADMINISTRATOR"
  | "MANAGER"
  | "CASHIER"
  | "BARISTA"
  | "INVENTORY_MANAGER";

export interface User {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  mustChangePassword?: boolean;
  branchId?: number;
  branchName?: string;
  createdAt?: string;
}

export interface Branch {
  id: number;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  productCount?: number;
  createdAt?: string;
}

export interface Unit {
  id: number;
  name: string;
  abbreviation: string;
  createdAt?: string;
}

export interface Product {
  id: number;
  sku: string;
  barcode?: string;
  name: string;
  categoryId?: number;
  categoryName?: string;
  unitId?: number;
  unitName?: string;
  retailPrice: number;
  costPrice: number;
  pickmePrice?: number;
  uberPrice?: number;
  isRecipeBased: boolean;
  reorderLevel: number;
  isActive: boolean;
  stock?: number;
  createdAt?: string;
}

export interface RawMaterial {
  id: number;
  code: string;
  name: string;
  unitId: number;
  unitName?: string;
  costPerUnit: number;
  reorderLevel: number;
  currentStock?: number;
  createdAt?: string;
}

export interface RecipeItem {
  id?: number;
  recipeId?: number;
  rawMaterialId: number;
  rawMaterialName?: string;
  quantity: number;
  unitId?: number;
  unitName?: string;
  unitCost?: number;
}

export interface Recipe {
  id: number;
  productId: number;
  productName?: string;
  name: string;
  yieldQuantity: number;
  instructions?: string;
  isActive: boolean;
  items?: RecipeItem[];
  totalCost?: number;
  createdAt?: string;
}

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  location?: string;
  branchId?: number;
  branchName?: string;
  createdAt?: string;
}

export interface InventoryStock {
  id: number;
  branchId: number;
  branchName?: string;
  productId?: number;
  productName?: string;
  productSku?: string;
  rawMaterialId?: number;
  rawMaterialName?: string;
  currentStock: number;
  reorderLevel: number;
  status: "NORMAL" | "LOW_STOCK" | "OUT_OF_STOCK" | "EXCESS";
  updatedAt?: string;
}

export interface InventoryBatch {
  id: number;
  branchId: number;
  warehouseId: number;
  warehouseName?: string;
  productId?: number;
  productName?: string;
  batchNumber: string;
  quantity: number;
  unitCost: number;
  expiryDate?: string;
  createdAt?: string;
}

export interface DiningTable {
  id: number;
  branchId: number;
  tableNumber: string;
  name: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING";
  currentOrderId?: string;
  createdAt?: string;
}

export interface VipRoom {
  id: number;
  branchId: number;
  roomNumber: string;
  name: string;
  capacity: number;
  minSpend?: number;
  hourlyRate?: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
  createdAt?: string;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  paymentTerms: string;
  address?: string;
  balance?: number;
  createdAt?: string;
}

export interface CustomerGroup {
  id: number;
  name: string;
  discountRate: number;
  customerCount?: number;
}

export interface Customer {
  id: number;
  customerCode: string;
  name: string;
  mobile: string;
  email?: string;
  groupId?: number;
  groupName?: string;
  discountRate?: number;
  loyaltyPoints: number;
  outstandingBalance: number;
  creditLimit: number;
  createdAt?: string;
}

export interface PurchaseOrderItem {
  id?: number;
  purchaseOrderId?: number;
  productId?: number;
  productName?: string;
  rawMaterialId?: number;
  rawMaterialName?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplierName?: string;
  branchId: number;
  branchName?: string;
  totalAmount: number;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED" | "RECEIVED" | "CANCELLED";
  items?: PurchaseOrderItem[];
  createdAt?: string;
}

export interface GRNItem {
  id?: number;
  grnId?: number;
  productId?: number;
  productName?: string;
  rawMaterialId?: number;
  rawMaterialName?: string;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface GRN {
  id: number;
  grnNumber: string;
  purchaseOrderId?: number;
  poNumber?: string;
  supplierId: number;
  supplierName?: string;
  branchId: number;
  branchName?: string;
  invoiceNumber?: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  status: "RECEIVED" | "VERIFIED" | "CANCELLED";
  items?: GRNItem[];
  createdAt?: string;
}

export interface GRNPayment {
  id: number;
  grnId: number;
  grnNumber?: string;
  supplierName?: string;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "CHEQUE";
  referenceNumber?: string;
  paymentDate: string;
  notes?: string;
}

export interface Promotion {
  id: number;
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "BUY_ONE_GET_ONE";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  createdAt?: string;
}

export interface SmsCampaign {
  id: number;
  campaignName: string;
  messageText: string;
  targetGroup?: string;
  recipientsCount: number;
  status: "SENT" | "SCHEDULED" | "DRAFT";
  sentAt?: string;
}

export interface CustomerReturnItem {
  id?: number;
  customerReturnId?: number;
  productId: number;
  productName?: string;
  quantity: number;
  refundAmount: number;
}

export interface CustomerReturn {
  id: number;
  returnNo: string;
  orderId?: string;
  customerId?: number;
  customerName?: string;
  totalRefundAmount: number;
  reason?: string;
  status: "PROCESSED" | "PENDING";
  items?: CustomerReturnItem[];
  createdAt?: string;
}

export interface SupplierReturnItem {
  id?: number;
  supplierReturnId?: number;
  productId?: number;
  productName?: string;
  rawMaterialId?: number;
  rawMaterialName?: string;
  quantity: number;
  refundAmount: number;
}

export interface SupplierReturn {
  id: number;
  returnNo: string;
  supplierId: number;
  supplierName?: string;
  totalRefundAmount: number;
  reason?: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  items?: SupplierReturnItem[];
  createdAt?: string;
}

export interface WarehouseProduction {
  id: number;
  productionNo: string;
  warehouseId: number;
  warehouseName?: string;
  recipeId: number;
  recipeName?: string;
  productId: number;
  productName?: string;
  quantityToProduce: number;
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  totalCost?: number;
  producedAt?: string;
  createdAt?: string;
}

export interface StockTransfer {
  id: number;
  transferNo: string;
  sourceWarehouseId: number;
  sourceWarehouseName?: string;
  destinationWarehouseId: number;
  destinationWarehouseName?: string;
  status: "REQUESTED" | "APPROVED" | "IN_TRANSIT" | "RECEIVED" | "CANCELLED";
  itemCount?: number;
  createdAt?: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  jobTitle: string;
  branch: string;
  branchId?: number;
  mobile: string;
  email?: string;
  employmentStatus: "ACTIVE" | "INACTIVE" | "ON_LEAVE" | "TERMINATED";
  hiredDate: string;
  salary?: number;
  createdAt?: string;
}

export interface JobTitle {
  id: number;
  title: string;
  department: string;
  description?: string;
  employeeCount?: number;
}

export interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  durationHours: number;
}

export interface EmployeeShift {
  id: number;
  employeeId: number;
  employeeName?: string;
  shiftId: number;
  shiftName?: string;
  shiftDate: string;
  status: "SCHEDULED" | "COMPLETED" | "MISSED";
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employeeName?: string;
  clockIn: string;
  clockOut?: string;
  overtimeHours: number;
  status?: "PRESENT" | "LATE" | "ABSENT";
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName?: string;
  leaveType: "ANNUAL" | "CASUAL" | "MEDICAL" | "UNPAID";
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string;
}

export interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeCode?: string;
  monthYear: string;
  baseAmount: number;
  overtimeAmount: number;
  claimsAmount: number;
  deductionsAmount: number;
  netPay: number;
  status: "DRAFT" | "PROCESSED" | "PAID";
  createdAt?: string;
}

export interface TransportClaim {
  id: number;
  employeeId: number;
  employeeName?: string;
  claimDate: string;
  distanceKm?: number;
  amount: number;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export type OrderType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
export type PaymentMethod = "CASH" | "CARD" | "CREDIT" | "ONLINE" | "QR";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  category?: string;
  notes?: string;
}

export interface PosOrder {
  id: string;
  orderNo: string;
  branchId: number;
  branchName?: string;
  cashierId?: number;
  cashierName?: string;
  customerId?: number;
  customerName?: string;
  tableId?: number;
  tableName?: string;
  orderType: OrderType;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  serviceCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeGiven: number;
  status: "COMPLETED" | "VOIDED" | "PENDING";
  kdsStatus: "RECEIVED" | "PREPARING" | "READY" | "SERVED";
  voidReason?: string;
  createdAt: string;
}

export interface SystemSettings {
  id: number;
  branchId: number;
  storeName: string;
  address?: string;
  phone?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  taxPercentage: number;
  serviceChargePercentage: number;
  currencySymbol: string;
  isNegativeStockAllowed: boolean;
}
