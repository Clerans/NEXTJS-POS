-- Migration 007: Inventory Stock & Ledger Enhancements

CREATE INDEX IF NOT EXISTS idx_inventory_stock_branch ON inventory_stock(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_status ON inventory_stock(status);

-- Seed stock levels for products if missing
INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
SELECT 1, p.id, 45.00, p.reorder_level, 'NORMAL'
FROM products p
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_stock s WHERE s.product_id = p.id AND s.branch_id = 1
);
