"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  mobileOpen,
  setMobileOpen,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  // Accordion state for sidebar submenus
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    products: pathname.startsWith("/products"),
    customers: pathname.startsWith("/customers"),
    permissions: pathname.startsWith("/permissions"),
    po: pathname.startsWith("/purchase-order"),
    grn: pathname.startsWith("/grn"),
    promotions: pathname.startsWith("/promotions"),
    returns: pathname.startsWith("/returns"),
    reports: pathname.startsWith("/reports"),
    warehouse: pathname.startsWith("/warehouse"),
    hr: pathname.startsWith("/hr"),
  });

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("nexuspos_user");
      localStorage.removeItem("nexuspos_auth_token");
    }
    toast.info("Logged out successfully");
    router.push("/login");
  };

  const closeOnMobile = () => {
    if (mobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-25 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={cn("sidebar", mobileOpen && "mobile-open")}>
        {/* Header Branding */}
        <div className="sidebar-header">
          <div className="logo-badge">NEXUS</div>
          <div>
            <div className="brand-name">NEXUSPOS</div>
            <div className="brand-sub">Management System</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="nav">
          {/* 1. Dashboard */}
          <Link
            href="/dashboard"
            onClick={closeOnMobile}
            className={cn("nav-item", pathname === "/dashboard" && "active")}
          >
            <span className="nav-icon">
              <LayoutDashboard className="lucide w-4.5 h-4.5" />
            </span>
            Dashboard
          </Link>

          {/* 2. Sales */}
          <Link
            href="/sales"
            onClick={closeOnMobile}
            className={cn("nav-item", pathname === "/sales" && "active")}
          >
            <span className="nav-icon">
              <ChartSpline className="lucide w-4.5 h-4.5" />
            </span>
            Sales
          </Link>

          {/* 3. Products */}
          <div>
            <div
              className={cn("nav-item", openGroups.products && "open")}
              onClick={() => toggleGroup("products")}
            >
              <span className="nav-icon">
                <Package className="lucide w-4.5 h-4.5" />
              </span>
              Products
              <ChevronRight className="chev lucide w-3.5 h-3.5" />
            </div>
            {openGroups.products && (
              <div className="nav-sub">
                <Link href="/products/category" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/category" && "active")}>Category</Link>
                <Link href="/products/units" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/units" && "active")}>Units</Link>
                <Link href="/products/all-products" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/all-products" && "active")}>All Products</Link>
                <Link href="/products/inventory" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/inventory" && "active")}>Products Inventory</Link>
                <Link href="/products/raw-materials" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/raw-materials" && "active")}>Raw Materials</Link>
                <Link href="/products/raw-material-inventory" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/raw-material-inventory" && "active")}>Raw Material Inventory</Link>
                <Link href="/products/recipes" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/recipes" && "active")}>Recipes</Link>
                <Link href="/products/stock-alerts" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/stock-alerts" && "active")}>Stock Alerts</Link>
                <Link href="/products/batch-management" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/batch-management" && "active")}>Batch Inventory Management</Link>
                <Link href="/products/vip-rooms" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/vip-rooms" && "active")}>VIP Rooms</Link>
                <Link href="/products/tables" onClick={closeOnMobile} className={cn("nav-item", pathname === "/products/tables" && "active")}>Tables</Link>
              </div>
            )}
          </div>

          {/* 4. Suppliers */}
          <Link
            href="/suppliers"
            onClick={closeOnMobile}
            className={cn("nav-item", pathname === "/suppliers" && "active")}
          >
            <span className="nav-icon">
              <Truck className="lucide w-4.5 h-4.5" />
            </span>
            Suppliers
          </Link>

          {/* 5. Customers */}
          <div>
            <div
              className={cn("nav-item", openGroups.customers && "open")}
              onClick={() => toggleGroup("customers")}
            >
              <span className="nav-icon">
                <Users className="lucide w-4.5 h-4.5" />
              </span>
              Customers
              <ChevronRight className="chev lucide w-3.5 h-3.5" />
            </div>
            {openGroups.customers && (
              <div className="nav-sub">
                <Link href="/customers/all" onClick={closeOnMobile} className={cn("nav-item", pathname === "/customers/all" && "active")}>All Customers</Link>
                <Link href="/customers/groups" onClick={closeOnMobile} className={cn("nav-item", pathname === "/customers/groups" && "active")}>Customers Group</Link>
              </div>
            )}
          </div>

          {/* 6. Permissions */}
          <div>
            <div
              className={cn("nav-item", openGroups.permissions && "open")}
              onClick={() => toggleGroup("permissions")}
            >
              <span className="nav-icon">
                <ShieldCheck className="lucide w-4.5 h-4.5" />
              </span>
              Permissions
              <ChevronRight className="chev lucide w-3.5 h-3.5" />
            </div>
            {openGroups.permissions && (
              <div className="nav-sub">
                <Link href="/permissions/branches" onClick={closeOnMobile} className={cn("nav-item", pathname === "/permissions/branches" && "active")}>Branches</Link>
                <Link href="/permissions/users" onClick={closeOnMobile} className={cn("nav-item", pathname === "/permissions/users" && "active")}>Users</Link>
              </div>
            )}
          </div>

          {/* 7. Purchase Order */}
          <div>
            <div
              className={cn("nav-item", openGroups.po && "open")}
              onClick={() => toggleGroup("po")}
            >
              <span className="nav-icon">
                <ShoppingCart className="lucide w-4.5 h-4.5" />
              </span>
              Purchase Order
              <ChevronRight className="chev lucide w-3.5 h-3.5" />
            </div>
            {openGroups.po && (
              <div className="nav-sub">
                <Link href="/purchase-order/create" onClick={closeOnMobile} className={cn("nav-item", pathname === "/purchase-order/create" && "active")}>Create PO</Link>
                <Link href="/purchase-order/all" onClick={closeOnMobile} className={cn("nav-item", pathname === "/purchase-order/all" && "active")}>All PO</Link>
              </div>
            )}
          </div>

          {/* 8. GRN */}
          <div>
            <div
              className={cn("nav-item", openGroups.grn && "open")}
              onClick={() => toggleGroup("grn")}
            >
              <span className="nav-icon">
                <ClipboardCheck className="lucide w-4.5 h-4.5" />
              </span>
              GRN
              <ChevronRight className="chev lucide w-3.5 h-3.5" />
            </div>
            {openGroups.grn && (
              <div className="nav-sub">
                <Link href="/grn/create" onClick={closeOnMobile} className={cn("nav-item", pathname === "/grn/create" && "active")}>Create GRN</Link>
                <Link href="/grn/all" onClick={closeOnMobile} className={cn("nav-item", pathname === "/grn/all" && "active")}>All GRN</Link>
                <Link href="/grn/payment" onClick={closeOnMobile} className={cn("nav-item", pathname === "/grn/payment" && "active")}>GRN Payment</Link>
              </div>
            )}
          </div>

          {/* 9. Promotions */}
          <div>
            <div
              className={cn("nav-item", openGroups.promotions && "open")}
              onClick={() => toggleGroup("promotions")}
            >
              <span className="nav-icon">
                <BadgePercent className="lucide w-4.5 h-4.5" />
              </span>
              Promotions
              <ChevronRight className="chev lucide w-3.5 h-3.5" />
            </div>
            {openGroups.promotions && (
              <div className="nav-sub">
                <Link href="/promotions/all" onClick={closeOnMobile} className={cn("nav-item", pathname === "/promotions/all" && "active")}>All Promotions</Link>
                <Link href="/promotions/sms-campaigns" onClick={closeOnMobile} className={cn("nav-item", pathname === "/promotions/sms-campaigns" && "active")}>SMS Campaigns</Link>
              </div>
            )}
          </div>

          {/* 10. Returns */}
          <div>
            <div
              className={cn("nav-item", openGroups.returns && "open")}
              onClick={() => toggleGroup("returns")}
            >
              <span className="nav-icon">
                <RotateCcw className="lucide w-4.5 h-4.5" />
              </span>
              Returns
              <ChevronRight className="chev lucide w-3.5 h-3.5" />
            </div>
            {openGroups.returns && (
              <div className="nav-sub">
                <Link href="/returns/supplier" onClick={closeOnMobile} className={cn("nav-item", pathname === "/returns/supplier" && "active")}>Supplier Return</Link>
                <Link href="/returns/customer" onClick={closeOnMobile} className={cn("nav-item", pathname === "/returns/customer" && "active")}>Customer Return</Link>
              </div>
            )}
          </div>

          {/* 11. Reports */}
          <div>
            <div
              className={cn("nav-item", openGroups.reports && "open")}
              onClick={() => toggleGroup("reports")}
            >
              <span className="nav-icon">
                <FileBarChart2 className="lucide w-4.5 h-4.5" />
              </span>
              Reports
              <ChevronRight className="chev lucide w-3.5 h-3.5" />
            </div>
            {openGroups.reports && (
              <div className="nav-sub">
                <Link href="/reports/sales-summary" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/sales-summary" && "active")}>Sales Summary</Link>
                <Link href="/reports/payments" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/payments" && "active")}>Payments</Link>
                <Link href="/reports/product-summary" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/product-summary" && "active")}>Product Summary</Link>
                <Link href="/reports/raw-material-summary" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/raw-material-summary" && "active")}>Raw Material Summary</Link>
                <Link href="/reports/product-margin" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/product-margin" && "active")}>Product Margin</Link>
                <Link href="/reports/stock-alerts" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/stock-alerts" && "active")}>Stock Alerts</Link>
                <Link href="/reports/suppliers" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/suppliers" && "active")}>Suppliers</Link>
                <Link href="/reports/customers" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/customers" && "active")}>Customers</Link>
                <Link href="/reports/employees" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/employees" && "active")}>Employees</Link>
                <Link href="/reports/salary" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/salary" && "active")}>Salary Reports</Link>
                <Link href="/reports/customer-returns" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/customer-returns" && "active")}>Customer Returns</Link>
                <Link href="/reports/leave" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/leave" && "active")}>Leave Reports</Link>
                <Link href="/reports/supplier-returns" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/supplier-returns" && "active")}>Supplier Returns</Link>
                <Link href="/reports/wastage" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/wastage" && "active")}>Wastage Report</Link>
                <Link href="/reports/profit" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/profit" && "active")}>Profit Report</Link>
                <Link href="/reports/service-charge" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/service-charge" && "active")}>Service Charge</Link>
                <Link href="/reports/product-wise-sales" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/product-wise-sales" && "active")}>Product-Wise Sales</Link>
                <Link href="/reports/negative-stock" onClick={closeOnMobile} className={cn("nav-item", pathname === "/reports/negative-stock" && "active")}>Negative Stock Report</Link>
              </div>
            )}
          </div>

          {/* 12. Warehouse */}
          <div>
            <div
              className={cn("nav-item", openGroups.warehouse && "open")}
              onClick={() => toggleGroup("warehouse")}
            >
              <span className="nav-icon">
                <Warehouse className="lucide w-4.5 h-4.5" />
              </span>
              Warehouse
              <ChevronRight className="chev lucide w-3.5 h-3.5" />
            </div>
            {openGroups.warehouse && (
              <div className="nav-sub">
                <Link href="/warehouse/productions" onClick={closeOnMobile} className={cn("nav-item", pathname === "/warehouse/productions" && "active")}>Warehouse Productions</Link>
                <Link href="/warehouse/transfer" onClick={closeOnMobile} className={cn("nav-item", pathname === "/warehouse/transfer" && "active")}>Products Transfer</Link>
              </div>
            )}
          </div>

          {/* 13. HR */}
          <div>
            <div
              className={cn("nav-item", openGroups.hr && "open")}
              onClick={() => toggleGroup("hr")}
            >
              <span className="nav-icon">
                <Briefcase className="lucide w-4.5 h-4.5" />
              </span>
              HR
              <ChevronRight className="chev lucide w-3.5 h-3.5" />
            </div>
            {openGroups.hr && (
              <div className="nav-sub">
                <Link href="/hr/jobs" onClick={closeOnMobile} className={cn("nav-item", pathname === "/hr/jobs" && "active")}>Jobs</Link>
                <Link href="/hr/employees" onClick={closeOnMobile} className={cn("nav-item", pathname === "/hr/employees" && "active")}>Employees</Link>
                <Link href="/hr/shifts" onClick={closeOnMobile} className={cn("nav-item", pathname === "/hr/shifts" && "active")}>Shifts</Link>
                <Link href="/hr/employee-shifts" onClick={closeOnMobile} className={cn("nav-item", pathname === "/hr/employee-shifts" && "active")}>Employee Shifts</Link>
                <Link href="/hr/attendance" onClick={closeOnMobile} className={cn("nav-item", pathname === "/hr/attendance" && "active")}>Attendance</Link>
                <Link href="/hr/leave" onClick={closeOnMobile} className={cn("nav-item", pathname === "/hr/leave" && "active")}>Leave Management</Link>
                <Link href="/hr/payroll" onClick={closeOnMobile} className={cn("nav-item", pathname === "/hr/payroll" && "active")}>Payroll Management</Link>
                <Link href="/hr/transport" onClick={closeOnMobile} className={cn("nav-item", pathname === "/hr/transport" && "active")}>Transport Claims</Link>
              </div>
            )}
          </div>

          {/* 14. POS */}
          <Link
            href="/pos"
            onClick={closeOnMobile}
            className={cn("nav-item", pathname === "/pos" && "active")}
          >
            <span className="nav-icon">
              <MonitorSmartphone className="lucide w-4.5 h-4.5" />
            </span>
            POS
          </Link>

          {/* 15. Settings */}
          <Link
            href="/settings"
            onClick={closeOnMobile}
            className={cn("nav-item", pathname === "/settings" && "active")}
          >
            <span className="nav-icon">
              <Settings2 className="lucide w-4.5 h-4.5" />
            </span>
            Settings
          </Link>
        </nav>

        {/* Footer with Logout */}
        <div className="sidebar-footer">
          <div className="logout" onClick={handleLogout}>
            <LogOut className="lucide w-4 h-4" /> Logout
          </div>
        </div>
      </aside>
    </>
  );
};
