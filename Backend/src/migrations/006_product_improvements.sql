-- Migration 006: Product Search and Active Status Indexes

CREATE INDEX IF NOT EXISTS idx_products_active_cat ON products(is_active, category_id);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products(name);
