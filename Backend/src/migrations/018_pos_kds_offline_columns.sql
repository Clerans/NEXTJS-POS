-- Migration 018: Permanent POS Order KDS Status & Offline Reference Columns

DO $$
BEGIN
    -- 1. Ensure kds_status column exists with proper default on pos_orders
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pos_orders' AND column_name = 'kds_status'
    ) THEN
        ALTER TABLE pos_orders ADD COLUMN kds_status VARCHAR(30) DEFAULT 'RECEIVED';
    END IF;

    -- 2. Ensure offline_ref column exists on pos_orders
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pos_orders' AND column_name = 'offline_ref'
    ) THEN
        ALTER TABLE pos_orders ADD COLUMN offline_ref VARCHAR(100);
    END IF;
END $$;

-- 3. Create Unique Index on offline_ref if not already present
CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_orders_offline_ref ON pos_orders(offline_ref) WHERE offline_ref IS NOT NULL;

-- 4. Create Index on kds_status for fast KDS ticket lookups
CREATE INDEX IF NOT EXISTS idx_pos_orders_kds_status ON pos_orders(kds_status);
