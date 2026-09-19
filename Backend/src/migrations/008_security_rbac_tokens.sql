-- Migration 008: RBAC Tables, User Branches, and Refresh Token Revocation Store

-- 1. Ensure pin_code_hash and email on users
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_code_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(150);

-- 2. Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  module VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Role Permissions Mapping Table
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INT REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 5. User Roles Mapping Table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role_id INT REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 6. User Authorized Branches Mapping Table (References branches.id)
CREATE TABLE IF NOT EXISTS user_branches (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, branch_id)
);

-- 7. Refresh Tokens Store (For Rotation and Revocation / Logout)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  replaced_by_token_hash VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

-- Seed Default Roles
INSERT INTO roles (code, name, description) VALUES
  ('ADMINISTRATOR', 'Administrator', 'Full unrestricted system access across all branches'),
  ('MANAGER', 'Branch Manager', 'Store operations, inventory management, reports, and team oversight'),
  ('CASHIER', 'POS Cashier', 'Point of sale order creation, checkout, and receipt printing'),
  ('BARISTA', 'Kitchen Barista', 'Order queue execution and recipe fulfillment'),
  ('WAREHOUSE', 'Warehouse Manager', 'Stock transfers, GRN, and purchase order receiving'),
  ('HR', 'HR Specialist', 'Employee records, attendance tracking, and payroll processing'),
  ('ACCOUNTANT', 'Financial Accountant', 'Financial audit logs, tax configuration, and sales summary reports')
ON CONFLICT (code) DO NOTHING;

-- Seed Default Canonical Permissions
INSERT INTO permissions (code, module, description) VALUES
  ('PRODUCT_VIEW', 'products', 'View catalog products and pricing'),
  ('PRODUCT_CREATE', 'products', 'Create new catalog products'),
  ('PRODUCT_UPDATE', 'products', 'Modify existing catalog products'),
  ('PRODUCT_DELETE', 'products', 'Delete catalog products'),

  ('INVENTORY_VIEW', 'inventory', 'View stock levels and movement ledgers'),
  ('INVENTORY_ADJUST', 'inventory', 'Perform manual stock adjustments'),
  ('INVENTORY_TRANSFER', 'inventory', 'Initiate and complete warehouse stock transfers'),

  ('POS_CREATE', 'pos', 'Create POS checkout transactions'),
  ('POS_VOID', 'pos', 'Void active or completed POS transactions'),
  ('POS_REFUND', 'pos', 'Issue customer refunds'),

  ('PURCHASE_VIEW', 'purchasing', 'View supplier purchase orders'),
  ('PURCHASE_CREATE', 'purchasing', 'Create supplier purchase orders'),
  ('PURCHASE_APPROVE', 'purchasing', 'Approve pending purchase orders'),

  ('GRN_VIEW', 'grn', 'View Goods Received Notes'),
  ('GRN_CREATE', 'grn', 'Receive goods and create GRN documents'),

  ('REPORT_VIEW', 'reports', 'Access analytics and business reporting'),

  ('USER_VIEW', 'users', 'View system user accounts'),
  ('USER_CREATE', 'users', 'Register new user accounts'),
  ('USER_UPDATE', 'users', 'Modify user details and roles'),
  ('USER_DELETE', 'users', 'Deactivate or delete user accounts'),

  ('HR_EMPLOYEE_VIEW', 'hr', 'View employee profiles'),
  ('HR_EMPLOYEE_CREATE', 'hr', 'Create new employee profile'),
  ('HR_EMPLOYEE_UPDATE', 'hr', 'Modify employee details'),
  ('HR_ATTENDANCE_VIEW', 'hr', 'View attendance records'),
  ('HR_ATTENDANCE_MANAGE', 'hr', 'Clock in/out and manage attendance'),
  ('HR_LEAVE_VIEW', 'hr', 'View leave requests'),
  ('HR_LEAVE_APPROVE', 'hr', 'Approve or reject leave requests'),
  ('HR_PAYROLL_VIEW', 'hr', 'View payroll records'),
  ('HR_PAYROLL_MANAGE', 'hr', 'Calculate and finalize monthly payroll'),

  ('SETTINGS_MANAGE', 'settings', 'Configure store and system settings')
ON CONFLICT (code) DO NOTHING;
