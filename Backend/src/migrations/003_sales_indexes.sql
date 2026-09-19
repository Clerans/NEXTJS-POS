-- Migration 003: Sales History Performance Indexes

CREATE INDEX IF NOT EXISTS idx_pos_orders_order_no_trgm ON pos_orders(order_no);
CREATE INDEX IF NOT EXISTS idx_pos_orders_customer_id ON pos_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_name_search ON customers(name);
CREATE INDEX IF NOT EXISTS idx_customers_mobile_search ON customers(mobile);

