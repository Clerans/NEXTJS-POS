export const ROUTES = {
  DASHBOARD: '/dashboard',
  SALES: '/sales',

  // Products
  PRODUCTS_CATEGORY: '/products/category',
  PRODUCTS_UNITS: '/products/units',
  PRODUCTS_ALL: '/products/all-products',
  PRODUCTS_INVENTORY: '/products/inventory',
  PRODUCTS_RAW_MATERIALS: '/products/raw-materials',
  PRODUCTS_RAW_INVENTORY: '/products/raw-material-inventory',
  PRODUCTS_RECIPES: '/products/recipes',
  PRODUCTS_STOCK_ALERTS: '/products/stock-alerts',
  PRODUCTS_BATCH_MANAGEMENT: '/products/batch-management',
  PRODUCTS_VIP_ROOMS: '/products/vip-rooms',
  PRODUCTS_TABLES: '/products/tables',

  SUPPLIERS: '/suppliers',

  // Customers
  CUSTOMERS_ALL: '/customers/all',
  CUSTOMERS_GROUPS: '/customers/groups',

  // Permissions
  PERMISSIONS_BRANCHES: '/permissions/branches',
  PERMISSIONS_USERS: '/permissions/users',

  // Purchase Order
  PO_CREATE: '/purchase-order/create',
  PO_ALL: '/purchase-order/all',

  // GRN
  GRN_CREATE: '/grn/create',
  GRN_ALL: '/grn/all',
  GRN_PAYMENT: '/grn/payment',

  // Promotions
  PROMOTIONS_ALL: '/promotions/all',
  PROMOTIONS_SMS_CAMPAIGNS: '/promotions/sms-campaigns',

  // Returns
  RETURNS_SUPPLIER: '/returns/supplier',
  RETURNS_CUSTOMER: '/returns/customer',

  // Reports
  REPORTS_SALES_SUMMARY: '/reports/sales-summary',
  REPORTS_PAYMENTS: '/reports/payments',
  REPORTS_PRODUCT_SUMMARY: '/reports/product-summary',
  REPORTS_RAW_MATERIAL_SUMMARY: '/reports/raw-material-summary',
  REPORTS_PRODUCT_MARGIN: '/reports/product-margin',
  REPORTS_STOCK_ALERTS: '/reports/stock-alerts',
  REPORTS_SUPPLIERS: '/reports/suppliers',
  REPORTS_CUSTOMERS: '/reports/customers',
  REPORTS_EMPLOYEES: '/reports/employees',
  REPORTS_SALARY: '/reports/salary',
  REPORTS_CUSTOMER_RETURNS: '/reports/customer-returns',
  REPORTS_LEAVE: '/reports/leave',
  REPORTS_SUPPLIER_RETURNS: '/reports/supplier-returns',
  REPORTS_WASTAGE: '/reports/wastage',
  REPORTS_PROFIT: '/reports/profit',
  REPORTS_SERVICE_CHARGE: '/reports/service-charge',
  REPORTS_PRODUCT_WISE_SALES: '/reports/product-wise-sales',
  REPORTS_NEGATIVE_STOCK: '/reports/negative-stock',

  // Warehouse
  WAREHOUSE_PRODUCTIONS: '/warehouse/productions',
  WAREHOUSE_TRANSFER: '/warehouse/transfer',

  // HR
  HR_JOBS: '/hr/jobs',
  HR_EMPLOYEES: '/hr/employees',
  HR_SHIFTS: '/hr/shifts',
  HR_EMPLOYEE_SHIFTS: '/hr/employee-shifts',
  HR_ATTENDANCE: '/hr/attendance',
  HR_LEAVE: '/hr/leave',
  HR_PAYROLL: '/hr/payroll',
  HR_TRANSPORT: '/hr/transport',

  POS: '/pos',
  SETTINGS: '/settings',

  AUTH_LOGIN: '/auth/login',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
} as const;
