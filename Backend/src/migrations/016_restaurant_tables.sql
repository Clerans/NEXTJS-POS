-- Migration 016: Restaurant Tables Master Data
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id SERIAL PRIMARY KEY,
  branch_id INT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  table_number VARCHAR(50) NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  availability VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_branch_table_number UNIQUE (branch_id, table_number)
);

CREATE INDEX IF NOT EXISTS idx_restaurant_tables_branch ON restaurant_tables(branch_id);
