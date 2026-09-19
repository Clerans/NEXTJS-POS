-- Migration 015: Warehouse Production & Manufacturing Domain

CREATE TABLE IF NOT EXISTS warehouse_productions (
  id SERIAL PRIMARY KEY,
  production_no VARCHAR(50) UNIQUE NOT NULL,
  product_id INT REFERENCES products(id) ON DELETE RESTRICT,
  warehouse_id INT REFERENCES warehouses(id) ON DELETE CASCADE,
  recipe_id INT REFERENCES recipes(id) ON DELETE RESTRICT,
  quantity NUMERIC(12, 2) NOT NULL,
  status VARCHAR(30) DEFAULT 'COMPLETED',
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS warehouse_production_items (
  id SERIAL PRIMARY KEY,
  production_id INT REFERENCES warehouse_productions(id) ON DELETE CASCADE,
  raw_material_id INT REFERENCES raw_materials(id) ON DELETE RESTRICT,
  quantity_consumed NUMERIC(12, 4) NOT NULL,
  unit_id INT REFERENCES units(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_warehouse_productions_prod ON warehouse_productions(product_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_productions_wh ON warehouse_productions(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_production_items_prod ON warehouse_production_items(production_id);
