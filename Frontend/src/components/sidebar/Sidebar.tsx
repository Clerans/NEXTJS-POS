import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/app/router/routes';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  LayoutDashboard,
  ChartSpline,
  Package,
  ChevronRight,
  Truck,
  Users,
  ShieldCheck,
  ShoppingCart,
  ClipboardCheck,
  BadgePercent,
  RotateCcw,
  FileBarChart2,
  Warehouse,
  Briefcase,
  MonitorSmartphone,
  Settings2,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Expanded submenus state based on active path
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    products: location.pathname.startsWith('/products'),
    customers: location.pathname.startsWith('/customers'),
    permissions: location.pathname.startsWith('/permissions'),
    po: location.pathname.startsWith('/purchase-order'),
    grn: location.pathname.startsWith('/grn'),
    promotions: location.pathname.startsWith('/promotions'),
    returns: location.pathname.startsWith('/returns'),
    reports: location.pathname.startsWith('/reports'),
    warehouse: location.pathname.startsWith('/warehouse'),
    hr: location.pathname.startsWith('/hr'),
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast.info('Logged out successfully');
    navigate(ROUTES.AUTH_LOGIN);
  };

  return (
    <aside
      className={cn(
        'sidebar',
        mobileOpen && 'mobile-open'
      )}
    >
      <div className="sidebar-header">
        <div className="logo-badge">NEXUS</div>
        <div>
          <div className="brand-name">NEXUSPOS</div>
          <div className="brand-sub">Management System</div>
        </div>
      </div>

      <nav className="nav">
        {/* 1. Dashboard */}
        <NavLink
          to={ROUTES.DASHBOARD}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => cn('nav-item', isActive && 'active')}
        >
          <span className="nav-icon"><LayoutDashboard className="lucide" /></span>
          Dashboard
        </NavLink>

        {/* 2. Sales */}
        <NavLink
          to={ROUTES.SALES}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => cn('nav-item', isActive && 'active')}
        >
          <span className="nav-icon"><ChartSpline className="lucide" /></span>
          Sales
        </NavLink>

        {/* 3. Products */}
        <div>
          <div
            className={cn('nav-item', openGroups.products && 'open')}
            onClick={() => toggleGroup('products')}
          >
            <span className="nav-icon"><Package className="lucide" /></span>
            Products
            <ChevronRight className="chev lucide" />
          </div>
          <AnimatePresence initial={false}>
            {openGroups.products && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="nav-sub expanded"
              >
                <NavLink to={ROUTES.PRODUCTS_CATEGORY} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Category</NavLink>
                <NavLink to={ROUTES.PRODUCTS_UNITS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Units</NavLink>
                <NavLink to={ROUTES.PRODUCTS_ALL} className={({ isActive }) => cn('nav-item', isActive && 'active')}>All Products</NavLink>
                <NavLink to={ROUTES.PRODUCTS_INVENTORY} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Products Inventory</NavLink>
                <NavLink to={ROUTES.PRODUCTS_RAW_MATERIALS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Raw Materials</NavLink>
                <NavLink to={ROUTES.PRODUCTS_RAW_INVENTORY} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Raw Material Inventory</NavLink>
                <NavLink to={ROUTES.PRODUCTS_RECIPES} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Recipes</NavLink>
                <NavLink to={ROUTES.PRODUCTS_STOCK_ALERTS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Stock Alerts</NavLink>
                <NavLink to={ROUTES.PRODUCTS_BATCH_MANAGEMENT} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Batch Inventory Mgmt</NavLink>
                <NavLink to={ROUTES.PRODUCTS_VIP_ROOMS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>VIP Rooms</NavLink>
                <NavLink to={ROUTES.PRODUCTS_TABLES} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Tables</NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 4. Suppliers */}
        <NavLink
          to={ROUTES.SUPPLIERS}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => cn('nav-item', isActive && 'active')}
        >
          <span className="nav-icon"><Truck className="lucide" /></span>
          Suppliers
        </NavLink>

        {/* 5. Customers */}
        <div>
          <div
            className={cn('nav-item', openGroups.customers && 'open')}
            onClick={() => toggleGroup('customers')}
          >
            <span className="nav-icon"><Users className="lucide" /></span>
            Customers
            <ChevronRight className="chev lucide" />
          </div>
          <AnimatePresence initial={false}>
            {openGroups.customers && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="nav-sub expanded"
              >
                <NavLink to={ROUTES.CUSTOMERS_ALL} className={({ isActive }) => cn('nav-item', isActive && 'active')}>All Customers</NavLink>
                <NavLink to={ROUTES.CUSTOMERS_GROUPS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Customers Group</NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 6. Permissions */}
        <div>
          <div
            className={cn('nav-item', openGroups.permissions && 'open')}
            onClick={() => toggleGroup('permissions')}
          >
            <span className="nav-icon"><ShieldCheck className="lucide" /></span>
            Permissions
            <ChevronRight className="chev lucide" />
          </div>
          <AnimatePresence initial={false}>
            {openGroups.permissions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="nav-sub expanded"
              >
                <NavLink to={ROUTES.PERMISSIONS_BRANCHES} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Branches</NavLink>
                <NavLink to={ROUTES.PERMISSIONS_USERS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Users</NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 7. Purchase Order */}
        <div>
          <div
            className={cn('nav-item', openGroups.po && 'open')}
            onClick={() => toggleGroup('po')}
          >
            <span className="nav-icon"><ShoppingCart className="lucide" /></span>
            Purchase Order
            <ChevronRight className="chev lucide" />
          </div>
          <AnimatePresence initial={false}>
            {openGroups.po && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="nav-sub expanded"
              >
                <NavLink to={ROUTES.PO_CREATE} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Create PO</NavLink>
                <NavLink to={ROUTES.PO_ALL} className={({ isActive }) => cn('nav-item', isActive && 'active')}>All PO</NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 8. GRN */}
        <div>
          <div
            className={cn('nav-item', openGroups.grn && 'open')}
            onClick={() => toggleGroup('grn')}
          >
            <span className="nav-icon"><ClipboardCheck className="lucide" /></span>
            GRN
            <ChevronRight className="chev lucide" />
          </div>
          <AnimatePresence initial={false}>
            {openGroups.grn && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="nav-sub expanded"
              >
                <NavLink to={ROUTES.GRN_CREATE} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Create GRN</NavLink>
                <NavLink to={ROUTES.GRN_ALL} className={({ isActive }) => cn('nav-item', isActive && 'active')}>All GRN</NavLink>
                <NavLink to={ROUTES.GRN_PAYMENT} className={({ isActive }) => cn('nav-item', isActive && 'active')}>GRN Payment</NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 9. Promotions */}
        <div>
          <div
            className={cn('nav-item', openGroups.promotions && 'open')}
            onClick={() => toggleGroup('promotions')}
          >
            <span className="nav-icon"><BadgePercent className="lucide" /></span>
            Promotions
            <ChevronRight className="chev lucide" />
          </div>
          <AnimatePresence initial={false}>
            {openGroups.promotions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="nav-sub expanded"
              >
                <NavLink to={ROUTES.PROMOTIONS_ALL} className={({ isActive }) => cn('nav-item', isActive && 'active')}>All Promotions</NavLink>
                <NavLink to={ROUTES.PROMOTIONS_SMS_CAMPAIGNS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>SMS Campaigns</NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 10. Returns */}
        <div>
          <div
            className={cn('nav-item', openGroups.returns && 'open')}
            onClick={() => toggleGroup('returns')}
          >
            <span className="nav-icon"><RotateCcw className="lucide" /></span>
            Returns
            <ChevronRight className="chev lucide" />
          </div>
          <AnimatePresence initial={false}>
            {openGroups.returns && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="nav-sub expanded"
              >
                <NavLink to={ROUTES.RETURNS_SUPPLIER} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Supplier Return</NavLink>
                <NavLink to={ROUTES.RETURNS_CUSTOMER} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Customer Return</NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 11. Reports */}
        <div>
          <div
            className={cn('nav-item', openGroups.reports && 'open')}
            onClick={() => toggleGroup('reports')}
          >
            <span className="nav-icon"><FileBarChart2 className="lucide" /></span>
            Reports
            <ChevronRight className="chev lucide" />
          </div>
          <AnimatePresence initial={false}>
            {openGroups.reports && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="nav-sub expanded"
              >
                <NavLink to={ROUTES.REPORTS_SALES_SUMMARY} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Sales Summary</NavLink>
                <NavLink to={ROUTES.REPORTS_PAYMENTS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Payments</NavLink>
                <NavLink to={ROUTES.REPORTS_PRODUCT_SUMMARY} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Product Summary</NavLink>
                <NavLink to={ROUTES.REPORTS_RAW_MATERIAL_SUMMARY} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Raw Material Summary</NavLink>
                <NavLink to={ROUTES.REPORTS_PRODUCT_MARGIN} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Product Margin</NavLink>
                <NavLink to={ROUTES.REPORTS_STOCK_ALERTS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Stock Alerts</NavLink>
                <NavLink to={ROUTES.REPORTS_SUPPLIERS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Suppliers</NavLink>
                <NavLink to={ROUTES.REPORTS_CUSTOMERS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Customers</NavLink>
                <NavLink to={ROUTES.REPORTS_EMPLOYEES} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Employees</NavLink>
                <NavLink to={ROUTES.REPORTS_SALARY} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Salary Reports</NavLink>
                <NavLink to={ROUTES.REPORTS_CUSTOMER_RETURNS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Customer Returns</NavLink>
                <NavLink to={ROUTES.REPORTS_LEAVE} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Leave Reports</NavLink>
                <NavLink to={ROUTES.REPORTS_SUPPLIER_RETURNS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Supplier Returns</NavLink>
                <NavLink to={ROUTES.REPORTS_WASTAGE} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Wastage Report</NavLink>
                <NavLink to={ROUTES.REPORTS_PROFIT} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Profit Report</NavLink>
                <NavLink to={ROUTES.REPORTS_SERVICE_CHARGE} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Service Charge</NavLink>
                <NavLink to={ROUTES.REPORTS_PRODUCT_WISE_SALES} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Product-Wise Sales</NavLink>
                <NavLink to={ROUTES.REPORTS_NEGATIVE_STOCK} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Negative Stock Report</NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 12. Warehouse */}
        <div>
          <div
            className={cn('nav-item', openGroups.warehouse && 'open')}
            onClick={() => toggleGroup('warehouse')}
          >
            <span className="nav-icon"><Warehouse className="lucide" /></span>
            Warehouse
            <ChevronRight className="chev lucide" />
          </div>
          <AnimatePresence initial={false}>
            {openGroups.warehouse && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="nav-sub expanded"
              >
                <NavLink to={ROUTES.WAREHOUSE_PRODUCTIONS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Warehouse Productions</NavLink>
                <NavLink to={ROUTES.WAREHOUSE_TRANSFER} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Products Transfer</NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 13. HR */}
        <div>
          <div
            className={cn('nav-item', openGroups.hr && 'open')}
            onClick={() => toggleGroup('hr')}
          >
            <span className="nav-icon"><Briefcase className="lucide" /></span>
            HR
            <ChevronRight className="chev lucide" />
          </div>
          <AnimatePresence initial={false}>
            {openGroups.hr && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="nav-sub expanded"
              >
                <NavLink to={ROUTES.HR_JOBS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Jobs</NavLink>
                <NavLink to={ROUTES.HR_EMPLOYEES} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Employees</NavLink>
                <NavLink to={ROUTES.HR_SHIFTS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Shifts</NavLink>
                <NavLink to={ROUTES.HR_EMPLOYEE_SHIFTS} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Employee Shifts</NavLink>
                <NavLink to={ROUTES.HR_ATTENDANCE} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Attendance</NavLink>
                <NavLink to={ROUTES.HR_LEAVE} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Leave Management</NavLink>
                <NavLink to={ROUTES.HR_PAYROLL} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Payroll Management</NavLink>
                <NavLink to={ROUTES.HR_TRANSPORT} className={({ isActive }) => cn('nav-item', isActive && 'active')}>Transport Claims</NavLink>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 14. POS */}
        <NavLink
          to={ROUTES.POS}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => cn('nav-item', isActive && 'active')}
        >
          <span className="nav-icon"><MonitorSmartphone className="lucide" /></span>
          POS
        </NavLink>

        {/* 15. Settings */}
        <NavLink
          to={ROUTES.SETTINGS}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) => cn('nav-item', isActive && 'active')}
        >
          <span className="nav-icon"><Settings2 className="lucide" /></span>
          Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="logout" onClick={handleLogout}>
          <LogOut className="lucide" /> Logout
        </div>
      </div>
    </aside>
  );
};
