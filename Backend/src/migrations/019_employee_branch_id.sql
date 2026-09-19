-- Migration 019: Relational Employee-to-Branch Mapping (branch_id foreign key)

DO $$
BEGIN
    -- 1. Add branch_id column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'branch_id'
    ) THEN
        ALTER TABLE employees ADD COLUMN branch_id INT REFERENCES branches(id) ON DELETE RESTRICT;
    END IF;

    -- 2. Populate branch_id by mapping existing string values from 'branch' column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'branch'
    ) THEN
        -- Exact match on branch name
        UPDATE employees e
        SET branch_id = b.id
        FROM branches b
        WHERE e.branch_id IS NULL AND LOWER(TRIM(e.branch)) = LOWER(TRIM(b.name));

        -- Match on branch code
        UPDATE employees e
        SET branch_id = b.id
        FROM branches b
        WHERE e.branch_id IS NULL AND LOWER(TRIM(e.branch)) = LOWER(TRIM(b.code));

        -- Match on known aliases (e.g., 'Colombo Main Outlet' -> 'MAIN' branch id 1)
        UPDATE employees e
        SET branch_id = 1
        WHERE e.branch_id IS NULL AND (
            LOWER(e.branch) LIKE '%main%' OR 
            LOWER(e.branch) LIKE '%colombo%'
        );

        UPDATE employees e
        SET branch_id = 2
        WHERE e.branch_id IS NULL AND LOWER(e.branch) LIKE '%hyde%';

        UPDATE employees e
        SET branch_id = 3
        WHERE e.branch_id IS NULL AND LOWER(e.branch) LIKE '%kandy%';

        -- Match numeric string to branch id
        UPDATE employees e
        SET branch_id = b.id
        FROM branches b
        WHERE e.branch_id IS NULL AND e.branch ~ '^[0-9]+$' AND e.branch::INT = b.id;

        -- Fallback default for any remaining unmapped employees (preserve data integrity)
        UPDATE employees
        SET branch_id = 1
        WHERE branch_id IS NULL;

        -- Make branch_id NOT NULL with default 1 once all rows are populated
        ALTER TABLE employees ALTER COLUMN branch_id SET NOT NULL;
        ALTER TABLE employees ALTER COLUMN branch_id SET DEFAULT 1;

        -- Allow branch string column to be nullable as it is superseded by branch_id
        ALTER TABLE employees ALTER COLUMN branch DROP NOT NULL;
    ELSE
        -- If branch column was never present, ensure branch_id has default 1
        UPDATE employees SET branch_id = 1 WHERE branch_id IS NULL;
        ALTER TABLE employees ALTER COLUMN branch_id SET NOT NULL;
        ALTER TABLE employees ALTER COLUMN branch_id SET DEFAULT 1;
    END IF;
END $$;

-- 3. Create Index on employees(branch_id) for fast filtering
CREATE INDEX IF NOT EXISTS idx_employees_branch_id ON employees(branch_id);
