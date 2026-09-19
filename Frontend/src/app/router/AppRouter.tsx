import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ROUTES } from './routes';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Eagerly loaded Auth & Core Layout pages
import { LoginPage } from '@/features/auth/login/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/forgot-password/ForgotPasswordPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

// Lazy loaded feature screens for optimal bundle splitting
const SalesPage = lazy(() => import('@/features/sales/SalesPage').then((m) => ({ default: m.SalesPage })));
const CategoryPage = lazy(() => import('@/features/products/category/CategoryPage').then((m) => ({ default: m.CategoryPage })));
const UnitsPage = lazy(() => import('@/features/products/units/UnitsPage').then((m) => ({ default: m.UnitsPage })));
const AllProductsPage = lazy(() => import('@/features/products/all-products/AllProductsPage').then((m) => ({ default: m.AllProductsPage })));
const ProductsInventoryPage = lazy(() => import('@/features/products/inventory/ProductsInventoryPage').then((m) => ({ default: m.ProductsInventoryPage })));
const RawMaterialsPage = lazy(() => import('@/features/products/raw-materials/RawMaterialsPage').then((m) => ({ default: m.RawMaterialsPage })));
const RawMaterialInventoryPage = lazy(() => import('@/features/products/raw-material-inventory/RawMaterialInventoryPage').then((m) => ({ default: m.RawMaterialInventoryPage })));
const RecipesPage = lazy(() => import('@/features/products/recipes/RecipesPage').then((m) => ({ default: m.RecipesPage })));
const StockAlertsPage = lazy(() => import('@/features/products/stock-alerts/StockAlertsPage').then((m) => ({ default: m.StockAlertsPage })));
const BatchManagementPage = lazy(() => import('@/features/products/batch-management/BatchManagementPage').then((m) => ({ default: m.BatchManagementPage })));
const VipRoomsPage = lazy(() => import('@/features/products/vip-rooms/VipRoomsPage').then((m) => ({ default: m.VipRoomsPage })));
const TablesPage = lazy(() => import('@/features/products/tables/TablesPage').then((m) => ({ default: m.TablesPage })));

const SuppliersPage = lazy(() => import('@/features/suppliers/SuppliersPage').then((m) => ({ default: m.SuppliersPage })));
const AllCustomersPage = lazy(() => import('@/features/customers/all-customers/AllCustomersPage').then((m) => ({ default: m.AllCustomersPage })));
const CustomerGroupsPage = lazy(() => import('@/features/customers/customer-groups/CustomerGroupsPage').then((m) => ({ default: m.CustomerGroupsPage })));

const BranchesPage = lazy(() => import('@/features/permissions/branches/BranchesPage').then((m) => ({ default: m.BranchesPage })));
const UsersPage = lazy(() => import('@/features/permissions/users/UsersPage').then((m) => ({ default: m.UsersPage })));

const CreatePoPage = lazy(() => import('@/features/purchase-order/create/CreatePoPage').then((m) => ({ default: m.CreatePoPage })));
const AllPoPage = lazy(() => import('@/features/purchase-order/all/AllPoPage').then((m) => ({ default: m.AllPoPage })));
const CreateGrnPage = lazy(() => import('@/features/grn/create/CreateGrnPage').then((m) => ({ default: m.CreateGrnPage })));
const AllGrnPage = lazy(() => import('@/features/grn/all/AllGrnPage').then((m) => ({ default: m.AllGrnPage })));
const GrnPaymentPage = lazy(() => import('@/features/grn/payment/GrnPaymentPage').then((m) => ({ default: m.GrnPaymentPage })));

const AllPromotionsPage = lazy(() => import('@/features/promotions/all/AllPromotionsPage').then((m) => ({ default: m.AllPromotionsPage })));
const SmsCampaignsPage = lazy(() => import('@/features/promotions/sms-campaigns/SmsCampaignsPage').then((m) => ({ default: m.SmsCampaignsPage })));
const SupplierReturnPage = lazy(() => import('@/features/returns/supplier/SupplierReturnPage').then((m) => ({ default: m.SupplierReturnPage })));
const CustomerReturnPage = lazy(() => import('@/features/returns/customer/CustomerReturnPage').then((m) => ({ default: m.CustomerReturnPage })));

const ReportPage = lazy(() => import('@/features/reports/ReportPage').then((m) => ({ default: m.ReportPage })));
const WarehouseProductionsPage = lazy(() => import('@/features/warehouse/productions/WarehouseProductionsPage').then((m) => ({ default: m.WarehouseProductionsPage })));
const ProductsTransferPage = lazy(() => import('@/features/warehouse/transfer/ProductsTransferPage').then((m) => ({ default: m.ProductsTransferPage })));
const HrSubScreenPage = lazy(() => import('@/features/hr/HrSubScreenPage').then((m) => ({ default: m.HrSubScreenPage })));
const POSPage = lazy(() => import('@/features/pos/POSPage').then((m) => ({ default: m.POSPage })));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const LoadingFallback: React.FC = () => (
  <div className="py-20 text-center text-textGray font-medium text-xs">
    Loading page screen...
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.AUTH_LOGIN} replace />;
  }
  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
      { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
      { path: ROUTES.SALES, element: <Suspense fallback={<LoadingFallback />}><SalesPage /></Suspense> },

      // Products
      { path: ROUTES.PRODUCTS_CATEGORY, element: <Suspense fallback={<LoadingFallback />}><CategoryPage /></Suspense> },
      { path: ROUTES.PRODUCTS_UNITS, element: <Suspense fallback={<LoadingFallback />}><UnitsPage /></Suspense> },
      { path: ROUTES.PRODUCTS_ALL, element: <Suspense fallback={<LoadingFallback />}><AllProductsPage /></Suspense> },
      { path: ROUTES.PRODUCTS_INVENTORY, element: <Suspense fallback={<LoadingFallback />}><ProductsInventoryPage /></Suspense> },
      { path: ROUTES.PRODUCTS_RAW_MATERIALS, element: <Suspense fallback={<LoadingFallback />}><RawMaterialsPage /></Suspense> },
      { path: ROUTES.PRODUCTS_RAW_INVENTORY, element: <Suspense fallback={<LoadingFallback />}><RawMaterialInventoryPage /></Suspense> },
      { path: ROUTES.PRODUCTS_RECIPES, element: <Suspense fallback={<LoadingFallback />}><RecipesPage /></Suspense> },
      { path: ROUTES.PRODUCTS_STOCK_ALERTS, element: <Suspense fallback={<LoadingFallback />}><StockAlertsPage /></Suspense> },
      { path: ROUTES.PRODUCTS_BATCH_MANAGEMENT, element: <Suspense fallback={<LoadingFallback />}><BatchManagementPage /></Suspense> },
      { path: ROUTES.PRODUCTS_VIP_ROOMS, element: <Suspense fallback={<LoadingFallback />}><VipRoomsPage /></Suspense> },
      { path: ROUTES.PRODUCTS_TABLES, element: <Suspense fallback={<LoadingFallback />}><TablesPage /></Suspense> },

      // Suppliers & Customers
      { path: ROUTES.SUPPLIERS, element: <Suspense fallback={<LoadingFallback />}><SuppliersPage /></Suspense> },
      { path: ROUTES.CUSTOMERS_ALL, element: <Suspense fallback={<LoadingFallback />}><AllCustomersPage /></Suspense> },
      { path: ROUTES.CUSTOMERS_GROUPS, element: <Suspense fallback={<LoadingFallback />}><CustomerGroupsPage /></Suspense> },

      // Permissions
      { path: ROUTES.PERMISSIONS_BRANCHES, element: <Suspense fallback={<LoadingFallback />}><BranchesPage /></Suspense> },
      { path: ROUTES.PERMISSIONS_USERS, element: <Suspense fallback={<LoadingFallback />}><UsersPage /></Suspense> },

      // PO & GRN
      { path: ROUTES.PO_CREATE, element: <Suspense fallback={<LoadingFallback />}><CreatePoPage /></Suspense> },
      { path: ROUTES.PO_ALL, element: <Suspense fallback={<LoadingFallback />}><AllPoPage /></Suspense> },
      { path: ROUTES.GRN_CREATE, element: <Suspense fallback={<LoadingFallback />}><CreateGrnPage /></Suspense> },
      { path: ROUTES.GRN_ALL, element: <Suspense fallback={<LoadingFallback />}><AllGrnPage /></Suspense> },
      { path: ROUTES.GRN_PAYMENT, element: <Suspense fallback={<LoadingFallback />}><GrnPaymentPage /></Suspense> },

      // Promotions & Returns
      { path: ROUTES.PROMOTIONS_ALL, element: <Suspense fallback={<LoadingFallback />}><AllPromotionsPage /></Suspense> },
      { path: ROUTES.PROMOTIONS_SMS_CAMPAIGNS, element: <Suspense fallback={<LoadingFallback />}><SmsCampaignsPage /></Suspense> },
      { path: ROUTES.RETURNS_SUPPLIER, element: <Suspense fallback={<LoadingFallback />}><SupplierReturnPage /></Suspense> },
      { path: ROUTES.RETURNS_CUSTOMER, element: <Suspense fallback={<LoadingFallback />}><CustomerReturnPage /></Suspense> },

      // Reports (All connected to live reportsService backend API)
      { path: ROUTES.REPORTS_SALES_SUMMARY, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Sales Summary Report" subtitle="Overall gross & net sales" /></Suspense> },
      { path: ROUTES.REPORTS_PAYMENTS, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Payments Report" subtitle="Cash, card & online payments" /></Suspense> },
      { path: ROUTES.REPORTS_PRODUCT_SUMMARY, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Product Summary Report" subtitle="Volume sold per item category" /></Suspense> },
      { path: ROUTES.REPORTS_RAW_MATERIAL_SUMMARY, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Raw Material Summary Report" subtitle="Ingredient consumption log" /></Suspense> },
      { path: ROUTES.REPORTS_PRODUCT_MARGIN, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Product Margin Report" subtitle="Profit margins per menu item" /></Suspense> },
      { path: ROUTES.REPORTS_STOCK_ALERTS, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Stock Alerts Report" subtitle="Historical inventory shortage log" /></Suspense> },
      { path: ROUTES.REPORTS_SUPPLIERS, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Suppliers Report" subtitle="Vendor purchase volume summary" /></Suspense> },
      { path: ROUTES.REPORTS_CUSTOMERS, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Customers Report" subtitle="Top patron spending report" /></Suspense> },
      { path: ROUTES.REPORTS_EMPLOYEES, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Employees Report" subtitle="Staff sales performance" /></Suspense> },
      { path: ROUTES.REPORTS_SALARY, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Salary Reports" subtitle="Staff payroll history" /></Suspense> },
      { path: ROUTES.REPORTS_CUSTOMER_RETURNS, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Customer Returns Report" subtitle="Refund and exchange log" /></Suspense> },
      { path: ROUTES.REPORTS_LEAVE, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Leave Reports" subtitle="Staff attendance and leave balance" /></Suspense> },
      { path: ROUTES.REPORTS_SUPPLIER_RETURNS, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Supplier Returns Report" subtitle="Vendor return note history" /></Suspense> },
      { path: ROUTES.REPORTS_WASTAGE, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Wastage Report" subtitle="Spoilage and ingredient wastage" /></Suspense> },
      { path: ROUTES.REPORTS_PROFIT, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Profit Report" subtitle="Net operational profit breakdown" /></Suspense> },
      { path: ROUTES.REPORTS_SERVICE_CHARGE, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Service Charge Report" subtitle="Collected dine-in service charges" /></Suspense> },
      { path: ROUTES.REPORTS_PRODUCT_WISE_SALES, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Product-Wise Sales" subtitle="Itemized quantity sales breakdown" /></Suspense> },
      { path: ROUTES.REPORTS_NEGATIVE_STOCK, element: <Suspense fallback={<LoadingFallback />}><ReportPage title="Negative Stock Report" subtitle="Negative inventory audit log" /></Suspense> },

      // Warehouse
      { path: ROUTES.WAREHOUSE_PRODUCTIONS, element: <Suspense fallback={<LoadingFallback />}><WarehouseProductionsPage /></Suspense> },
      { path: ROUTES.WAREHOUSE_TRANSFER, element: <Suspense fallback={<LoadingFallback />}><ProductsTransferPage /></Suspense> },

      // HR (Connected to live hrService backend API)
      { path: ROUTES.HR_JOBS, element: <Suspense fallback={<LoadingFallback />}><HrSubScreenPage title="Jobs" subtitle="Job titles & designations" columns={['Job Title', 'Department', 'Base Salary']} data={[]} /></Suspense> },
      { path: ROUTES.HR_EMPLOYEES, element: <Suspense fallback={<LoadingFallback />}><HrSubScreenPage title="Employees" subtitle="Staff roster & profiles" columns={['Employee Name', 'Role', 'Mobile']} data={[]} /></Suspense> },
      { path: ROUTES.HR_SHIFTS, element: <Suspense fallback={<LoadingFallback />}><HrSubScreenPage title="Shifts" subtitle="Outlet shift timings" columns={['Shift Name', 'Start Time', 'End Time']} data={[]} /></Suspense> },
      { path: ROUTES.HR_EMPLOYEE_SHIFTS, element: <Suspense fallback={<LoadingFallback />}><HrSubScreenPage title="Employee Shifts" subtitle="Assigned shift schedules" columns={['Employee', 'Assigned Shift', 'Date']} data={[]} /></Suspense> },
      { path: ROUTES.HR_ATTENDANCE, element: <Suspense fallback={<LoadingFallback />}><HrSubScreenPage title="Attendance" subtitle="Daily clock-in / clock-out logs" columns={['Employee', 'Clock In', 'Clock Out']} data={[]} /></Suspense> },
      { path: ROUTES.HR_LEAVE, element: <Suspense fallback={<LoadingFallback />}><HrSubScreenPage title="Leave Management" subtitle="Staff leave requests" columns={['Employee', 'Leave Type', 'Status']} data={[]} /></Suspense> },
      { path: ROUTES.HR_PAYROLL, element: <Suspense fallback={<LoadingFallback />}><HrSubScreenPage title="Payroll Management" subtitle="Monthly salary disbursements" columns={['Employee', 'Month', 'Net Pay']} data={[]} /></Suspense> },
      { path: ROUTES.HR_TRANSPORT, element: <Suspense fallback={<LoadingFallback />}><HrSubScreenPage title="Transport Claims" subtitle="Staff transport allowance claims" columns={['Claim ID', 'Employee', 'Amount']} data={[]} /></Suspense> },

      // POS & Settings
      { path: ROUTES.POS, element: <Suspense fallback={<LoadingFallback />}><POSPage /></Suspense> },
      { path: ROUTES.SETTINGS, element: <Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense> },
    ],
  },
  { path: ROUTES.AUTH_LOGIN, element: <LoginPage /> },
  { path: ROUTES.AUTH_FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
  { path: '*', element: <Navigate to={ROUTES.AUTH_LOGIN} replace /> },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
