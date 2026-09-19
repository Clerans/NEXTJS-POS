-- Migration 011: Purchasing & Warehouse Schema Expansion

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='po_items' AND column_name='received_quantity'
    ) THEN
        ALTER TABLE po_items ADD COLUMN received_quantity NUMERIC(12, 2) DEFAULT 0;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='transfer_items' AND column_name='raw_material_id'
    ) THEN
        ALTER TABLE transfer_items ADD COLUMN raw_material_id INT REFERENCES raw_materials(id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='supplier_return_items' AND column_name='raw_material_id'
    ) THEN
        ALTER TABLE supplier_return_items ADD COLUMN raw_material_id INT REFERENCES raw_materials(id);
        ALTER TABLE supplier_return_items ALTER COLUMN product_id DROP NOT NULL;
    END IF;

    ALTER TABLE transfer_items ALTER COLUMN product_id DROP NOT NULL;
END $$;
