-- Migration 010: Inventory Stock Unique Constraint Safety

DELETE FROM inventory_stock a USING inventory_stock b
WHERE a.id < b.id 
  AND a.branch_id = b.branch_id 
  AND a.product_id = b.product_id 
  AND a.product_id IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_branch_product'
    ) THEN
        ALTER TABLE inventory_stock ADD CONSTRAINT unique_branch_product UNIQUE (branch_id, product_id);
    END IF;
END $$;
