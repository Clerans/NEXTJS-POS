-- Migration 012: Human Resources (HR) Module Expansion

ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary_amount NUMERIC(12,2) DEFAULT 75000.00;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS clock_out TIMESTAMP;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS late_minutes INT DEFAULT 0;

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    base_salary NUMERIC(12,2) DEFAULT 50000.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_shifts (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
    branch_id INT REFERENCES branches(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL, -- ANNUAL, CASUAL, MEDICAL
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED
    approved_by INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_balances (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
    annual_leave INT DEFAULT 14,
    casual_leave INT DEFAULT 7,
    medical_leave INT DEFAULT 14,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jobs (title, department, base_salary) VALUES
  ('Head Barista', 'Beverages', 95000.00),
  ('POS Cashier', 'Front Desk', 65000.00),
  ('Kitchen Chef', 'Culinary', 11000.00)
ON CONFLICT (title) DO NOTHING;
