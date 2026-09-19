-- Migration 002: Dashboard Performance Indexes

CREATE INDEX IF NOT EXISTS idx_pos_orders_created_status ON pos_orders(created_at, status);
CREATE INDEX IF NOT EXISTS idx_pos_orders_order_type ON pos_orders(order_type);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_low ON inventory_stock(current_stock, reorder_level);
