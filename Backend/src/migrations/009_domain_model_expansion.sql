-- Migration 009: Domain Model Expansion (Organization, Price Tiers, Raw Materials, Recipes, Batches, Adjustments)

-- 1. Branches & POS Terminals
CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO branches (id, code, name, address, phone) VALUES
  (1, 'MAIN', 'NEXUS Main Outlet', 'Colombo 03', '0112000001'),
  (2, 'HYDE', 'Hyde Park Outlet', 'Colombo 02', '0112000002'),
  (3, 'KANDY', 'Kandy Express Store', 'Kandy Central', '0812000003')
ON CONFLICT (code) DO NOTHING;

-- Link warehouses to branches
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS branch_id INT REFERENCES branches(id) ON DELETE SET NULL;
UPDATE warehouses SET branch_id = 1 WHERE branch_id IS NULL;

CREATE TABLE IF NOT EXISTS pos_terminals (
  id SERIAL PRIMARY KEY,
  branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
  terminal_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  status VARCHAR(30) DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO pos_terminals (branch_id, terminal_code, name) VALUES
  (1, 'TERM-MAIN-01', 'Main Counter POS 1'),
  (1, 'TERM-MAIN-02', 'Express Counter POS 2'),
  (2, 'TERM-HYDE-01', 'Hyde Park Counter 1')
ON CONFLICT (terminal_code) DO NOTHING;

-- 2. Product Price Tiers
CREATE TABLE IF NOT EXISTS product_prices (
  id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
  price_tier VARCHAR(50) NOT NULL, -- e.g. 'OUTLET', 'PICKME', 'UBER', 'DINE_IN'
  price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, branch_id, price_tier)
);

-- 3. Raw Materials & Batches
CREATE TABLE IF NOT EXISTS raw_materials (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  unit_id INT REFERENCES units(id) ON DELETE RESTRICT,
  cost_per_unit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  reorder_level NUMERIC(12, 2) DEFAULT 10.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_material_batches (
  id SERIAL PRIMARY KEY,
  raw_material_id INT REFERENCES raw_materials(id) ON DELETE CASCADE,
  warehouse_id INT REFERENCES warehouses(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_material_inventory (
  id SERIAL PRIMARY KEY,
  warehouse_id INT REFERENCES warehouses(id) ON DELETE CASCADE,
  raw_material_id INT REFERENCES raw_materials(id) ON DELETE CASCADE,
  current_stock NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  reorder_level NUMERIC(12, 2) NOT NULL DEFAULT 10.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(warehouse_id, raw_material_id)
);

-- 4. Recipes & Recipe Ingredients
CREATE TABLE IF NOT EXISTS recipes (
  id SERIAL PRIMARY KEY,
  product_id INT UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  yield_quantity NUMERIC(12, 2) DEFAULT 1.00,
  instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipe_items (
  id SERIAL PRIMARY KEY,
  recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
  raw_material_id INT REFERENCES raw_materials(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 4) NOT NULL,
  unit_id INT REFERENCES units(id) ON DELETE RESTRICT,
  UNIQUE(recipe_id, raw_material_id)
);

-- 5. Inventory Batches & Stock Adjustments
CREATE TABLE IF NOT EXISTS inventory_batches (
  id SERIAL PRIMARY KEY,
  branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
  warehouse_id INT REFERENCES warehouses(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_adjustments (
  id SERIAL PRIMARY KEY,
  adjustment_no VARCHAR(50) UNIQUE NOT NULL,
  branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
  warehouse_id INT REFERENCES warehouses(id) ON DELETE CASCADE,
  adjusted_by INT REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'COMPLETED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_adjustment_items (
  id SERIAL PRIMARY KEY,
  adjustment_id INT REFERENCES stock_adjustments(id) ON DELETE CASCADE,
  product_id INT REFERENCES products(id) ON DELETE SET NULL,
  raw_material_id INT REFERENCES raw_materials(id) ON DELETE SET NULL,
  previous_quantity NUMERIC(12, 2) NOT NULL,
  new_quantity NUMERIC(12, 2) NOT NULL,
  adjustment_quantity NUMERIC(12, 2) NOT NULL,
  unit_cost NUMERIC(12, 2) DEFAULT 0.00
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_raw_material_batches_mat ON raw_material_batches(raw_material_id);
CREATE INDEX IF NOT EXISTS idx_raw_material_batches_wh ON raw_material_batches(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_recipe_items_recipe ON recipe_items(recipe_id);
CREATE INDEX IF NOT EXISTS idx_inventory_batches_prod ON inventory_batches(product_id, branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustment_items_adj ON stock_adjustment_items(adjustment_id);
