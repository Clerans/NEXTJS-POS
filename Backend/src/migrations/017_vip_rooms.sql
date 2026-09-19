-- Migration 017: VIP Rooms Master Data
CREATE TABLE IF NOT EXISTS vip_rooms (
  id SERIAL PRIMARY KEY,
  branch_id INT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Medium',
  hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 3000.00,
  discount_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_branch_vip_room_name UNIQUE (branch_id, name)
);

CREATE INDEX IF NOT EXISTS idx_vip_rooms_branch ON vip_rooms(branch_id);
