-- Migration 001: NEXUSPOS Complete Relational Schema

-- 1. Users Table (Updated with must_change_password)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(150) NOT NULL,
  role VARCHAR(50) DEFAULT 'ADMINISTRATOR',
  must_change_password BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories & Units
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS units (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  abbreviation VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  barcode VARCHAR(100),
  name VARCHAR(200) NOT NULL,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  unit_id INT REFERENCES units(id) ON DELETE SET NULL,
  retail_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  is_recipe_based BOOLEAN DEFAULT FALSE,
  reorder_level NUMERIC(12, 2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 4. Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Inventory Stock & Ledger
CREATE TABLE IF NOT EXISTS inventory_stock (
  id SERIAL PRIMARY KEY,
  branch_id INT DEFAULT 1,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  raw_material_id INT,
  current_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  reorder_level NUMERIC(12, 2) NOT NULL DEFAULT 10.00,
  status VARCHAR(20) DEFAULT 'NORMAL',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_prod ON inventory_stock(branch_id, product_id);

CREATE TABLE IF NOT EXISTS inventory_ledger (
  id SERIAL PRIMARY KEY,
  branch_id INT DEFAULT 1,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  raw_material_id INT,
  batch_id INT,
  transaction_type VARCHAR(50) NOT NULL,
  reference_id VARCHAR(100),
  quantity_change NUMERIC(12, 2) NOT NULL,
  balance_after NUMERIC(12, 2) NOT NULL,
  unit_cost NUMERIC(12, 2) DEFAULT 0.00,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Stock Transfers
CREATE TABLE IF NOT EXISTS stock_transfers (
  id SERIAL PRIMARY KEY,
  transfer_no VARCHAR(50) UNIQUE NOT NULL,
  source_warehouse_id INT REFERENCES warehouses(id) ON DELETE CASCADE,
  destination_warehouse_id INT REFERENCES warehouses(id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'REQUESTED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transfer_items (
  id SERIAL PRIMARY KEY,
  transfer_id INT REFERENCES stock_transfers(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  quantity NUMERIC(12, 2) NOT NULL
);

-- 7. Suppliers & Customer Groups & Customers
CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  contact_person VARCHAR(150),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(150),
  payment_terms VARCHAR(50) DEFAULT 'NET 30',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  discount_rate NUMERIC(5, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  customer_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  mobile VARCHAR(50) NOT NULL,
  email VARCHAR(150),
  group_id INT REFERENCES customer_groups(id) ON DELETE SET NULL,
  loyalty_points INT DEFAULT 0,
  outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
  credit_limit NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Purchase Orders & GRNs
CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id INT REFERENCES suppliers(id) ON DELETE RESTRICT,
  branch_id INT DEFAULT 1,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'PENDING_APPROVAL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS po_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id INT REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  raw_material_id INT,
  quantity NUMERIC(12, 2) NOT NULL,
  unit_cost NUMERIC(12, 2) NOT NULL,
  total_cost NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS grns (
  id SERIAL PRIMARY KEY,
  grn_number VARCHAR(50) UNIQUE NOT NULL,
  purchase_order_id INT REFERENCES purchase_orders(id) ON DELETE SET NULL,
  supplier_id INT REFERENCES suppliers(id) ON DELETE RESTRICT,
  branch_id INT DEFAULT 1,
  invoice_number VARCHAR(100),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'RECEIVED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grn_items (
  id SERIAL PRIMARY KEY,
  grn_id INT REFERENCES grns(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  raw_material_id INT,
  quantity_received NUMERIC(12, 2) NOT NULL,
  unit_cost NUMERIC(12, 2) NOT NULL,
  total_cost NUMERIC(12, 2) NOT NULL
);

-- 9. POS Orders
CREATE TABLE IF NOT EXISTS pos_orders (
  id SERIAL PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  branch_id INT DEFAULT 1,
  cashier_id INT REFERENCES users(id) ON DELETE SET NULL,
  customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
  order_type VARCHAR(30) DEFAULT 'DINE_IN',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  discount_amount NUMERIC(12, 2) DEFAULT 0.00,
  tax_amount NUMERIC(12, 2) DEFAULT 0.00,
  service_charge NUMERIC(12, 2) DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(50) DEFAULT 'CASH',
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  change_given NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'COMPLETED',
  kds_status VARCHAR(30) DEFAULT 'RECEIVED',
  void_reason VARCHAR(255),
  voided_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pos_order_items (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES pos_orders(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE RESTRICT,
  product_name VARCHAR(200) NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL
);

-- 10. Promotions & SMS Campaigns
CREATE TABLE IF NOT EXISTS promotions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL,
  discount_value NUMERIC(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sms_campaigns (
  id SERIAL PRIMARY KEY,
  message_text TEXT NOT NULL,
  recipients_count INT NOT NULL DEFAULT 0,
  status VARCHAR(30) DEFAULT 'SENT',
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Customer & Supplier Returns
CREATE TABLE IF NOT EXISTS customer_returns (
  id SERIAL PRIMARY KEY,
  return_no VARCHAR(50) UNIQUE NOT NULL,
  order_id INT REFERENCES pos_orders(id) ON DELETE SET NULL,
  customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
  total_refund_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'PROCESSED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customer_return_items (
  id SERIAL PRIMARY KEY,
  customer_return_id INT REFERENCES customer_returns(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 2) NOT NULL,
  refund_amount NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS supplier_returns (
  id SERIAL PRIMARY KEY,
  return_no VARCHAR(50) UNIQUE NOT NULL,
  supplier_id INT REFERENCES suppliers(id) ON DELETE RESTRICT,
  total_refund_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'APPROVED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS supplier_return_items (
  id SERIAL PRIMARY KEY,
  supplier_return_id INT REFERENCES supplier_returns(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 2) NOT NULL,
  refund_amount NUMERIC(12, 2) NOT NULL
);

-- 12. HR (Employees, Attendance, Payroll)
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  employee_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  job_title VARCHAR(100) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  mobile VARCHAR(50) NOT NULL,
  employment_status VARCHAR(30) DEFAULT 'ACTIVE',
  hired_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  clock_in TIMESTAMP NOT NULL,
  clock_out TIMESTAMP,
  overtime_hours NUMERIC(5, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS payroll (
  id SERIAL PRIMARY KEY,
  employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
  month_year VARCHAR(20) NOT NULL,
  base_amount NUMERIC(12, 2) NOT NULL,
  overtime_amount NUMERIC(12, 2) DEFAULT 0.00,
  claims_amount NUMERIC(12, 2) DEFAULT 0.00,
  deductions_amount NUMERIC(12, 2) DEFAULT 0.00,
  net_pay NUMERIC(12, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. System Settings & Audit Logs
CREATE TABLE IF NOT EXISTS system_settings (
  id SERIAL PRIMARY KEY,
  branch_id INT UNIQUE NOT NULL DEFAULT 1,
  store_name VARCHAR(200) NOT NULL DEFAULT 'NEXUSPOS Cafe & Restaurant',
  receipt_header TEXT,
  receipt_footer TEXT,
  tax_percentage NUMERIC(5, 2) DEFAULT 10.00,
  currency_symbol VARCHAR(10) DEFAULT 'Rs.',
  is_negative_stock_allowed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  username VARCHAR(100),
  action VARCHAR(100) NOT NULL,
  entity_name VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
