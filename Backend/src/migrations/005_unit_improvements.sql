-- Migration 005: Units Table Enhancements

ALTER TABLE units ADD COLUMN IF NOT EXISTS type VARCHAR(30) DEFAULT 'Quantity';
ALTER TABLE units ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active';
ALTER TABLE units ADD COLUMN IF NOT EXISTS icon VARCHAR(20) DEFAULT '📦';

-- Update existing default units with type and icons
UPDATE units SET type = 'Quantity', icon = '📦' WHERE abbreviation IN ('pcs', 'cup');
UPDATE units SET type = 'Weight', icon = '⚖️' WHERE abbreviation IN ('kg', 'g');
UPDATE units SET type = 'Volume', icon = '🥤' WHERE abbreviation IN ('L', 'ml');

CREATE UNIQUE INDEX IF NOT EXISTS idx_units_abbr_unique ON units(LOWER(abbreviation));
