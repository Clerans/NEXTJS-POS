-- Migration 014: GRN Payments Table & Settlement Tracking

ALTER TABLE grns ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(12, 2) DEFAULT 0.00;
ALTER TABLE grns ADD COLUMN IF NOT EXISTS payment_status VARCHAR(30) DEFAULT 'UNPAID';

CREATE TABLE IF NOT EXISTS grn_payments (
  id SERIAL PRIMARY KEY,
  grn_id INT REFERENCES grns(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH',
  reference_no VARCHAR(100),
  paid_by INT REFERENCES users(id) ON DELETE SET NULL,
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_grn_payments_grn ON grn_payments(grn_id);
