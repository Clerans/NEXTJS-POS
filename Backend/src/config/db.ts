import pg from 'pg';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { config } from './env.js';

const { Pool } = pg;

const isSsl = 
  process.env.DB_SSL === 'true' || 
  (config.db.connectionString && (config.db.connectionString.includes('supabase.com') || config.db.connectionString.includes('sslmode=')));

export const pool = new Pool(
  config.db.connectionString
    ? {
        connectionString: config.db.connectionString,
        ssl: isSsl ? { rejectUnauthorized: false } : undefined,
        max: config.db.poolMax,
        idleTimeoutMillis: config.db.idleTimeoutMillis,
        connectionTimeoutMillis: config.db.connectionTimeoutMillis,
      }
    : {
        host: config.db.host,
        port: config.db.port,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        ssl: isSsl ? { rejectUnauthorized: false } : undefined,
        max: config.db.poolMax,
        idleTimeoutMillis: config.db.idleTimeoutMillis,
        connectionTimeoutMillis: config.db.connectionTimeoutMillis,
      }
);

pool.on('error', (err: Error) => {
  console.error('[PostgreSQL Pool Error]', err);
});

let initPromise: Promise<void> | null = null;

export const initDatabase = async (): Promise<void> => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const client = await pool.connect();
    try {
      console.log(`[PostgreSQL] Connected to database: ${config.db.database}`);

      // Ensure schema migrations tracking table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          migration_name VARCHAR(255) UNIQUE NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Migration files in strict dependency order (009 before 008 because 008 user_branches references 009 branches)
      const migrationFiles = [
        '001_all_tables.sql',
        '002_dashboard_indexes.sql',
        '003_sales_indexes.sql',
        '004_category_improvements.sql',
        '005_unit_improvements.sql',
        '006_product_improvements.sql',
        '007_inventory_improvements.sql',
        '009_domain_model_expansion.sql',
        '008_security_rbac_tokens.sql',
        '010_inventory_stock_unique.sql',
        '011_purchasing_warehouse_expansion.sql',
        '012_hr_module_expansion.sql',
        '013_password_reset_tokens.sql',
        '014_grn_payments.sql',
        '015_warehouse_productions.sql',
        '016_restaurant_tables.sql',
        '017_vip_rooms.sql',
        '018_pos_kds_offline_columns.sql',
        '019_employee_branch_id.sql',
      ];

      for (const fileName of migrationFiles) {
        const checkRes = await client.query(
          'SELECT migration_name FROM schema_migrations WHERE migration_name = $1',
          [fileName]
        );
        if (checkRes.rows.length === 0) {
          const migrationPath = path.join(process.cwd(), 'src/migrations', fileName);
          const fallbackPath = path.join(process.cwd(), 'dist/migrations', fileName);

          let sql = '';
          if (fs.existsSync(migrationPath)) {
            sql = fs.readFileSync(migrationPath, 'utf8');
          } else if (fs.existsSync(fallbackPath)) {
            sql = fs.readFileSync(fallbackPath, 'utf8');
          }

          if (sql) {
            try {
              await client.query('BEGIN');
              await client.query(sql);
              await client.query(
                'INSERT INTO schema_migrations (migration_name) VALUES ($1) ON CONFLICT DO NOTHING',
                [fileName]
              );
              await client.query('COMMIT');
              console.log(`[PostgreSQL] Applied migration: ${fileName}`);
            } catch (migErr) {
              await client.query('ROLLBACK');
              console.error(`[PostgreSQL] Migration failed for ${fileName}:`, migErr);
              throw migErr;
            }
          } else {
            throw new Error(`Migration file not found on disk: ${fileName}`);
          }
        }
      }

      // Ensure critical column extensions exist
      await client.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT TRUE;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS pin_code_hash VARCHAR(255);
        ALTER TABLE grns ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(12, 2) DEFAULT 0.00;
        ALTER TABLE grns ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'UNPAID';
        ALTER TABLE supplier_return_items ADD COLUMN IF NOT EXISTS raw_material_id INT REFERENCES raw_materials(id);
        ALTER TABLE supplier_return_items ALTER COLUMN product_id DROP NOT NULL;
      `);

      // Baseline Admin User (essential system initialization)
      const res = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);
      if (res.rows.length === 0) {
        const initialPassword = config.adminInitialPassword;
        const initialPin = config.adminInitialPin;
        if (!initialPassword || !initialPin) {
          throw new Error('ADMIN_INITIAL_PASSWORD and ADMIN_INITIAL_PIN must be defined for baseline admin creation');
        }
        const hashedPassword = await bcrypt.hash(initialPassword, 10);
        const hashedPin = await bcrypt.hash(initialPin, 10);
        await client.query(
          'INSERT INTO users (username, password, name, role, must_change_password, pin_code_hash) VALUES ($1, $2, $3, $4, $5, $6)',
          ['admin', hashedPassword, 'NEXUSPOS Administrator', 'ADMINISTRATOR', true, hashedPin]
        );
        console.log('[PostgreSQL] Baseline system administrator user created.');
      }

      // Ensure sequence generators are synced to current MAX(id) across primary tables
      await client.query(`
        SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT COALESCE(MAX(id), 1) FROM users));
        SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT COALESCE(MAX(id), 1) FROM categories));
        SELECT setval(pg_get_serial_sequence('units', 'id'), (SELECT COALESCE(MAX(id), 1) FROM units));
        SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT COALESCE(MAX(id), 1) FROM products));
        SELECT setval(pg_get_serial_sequence('warehouses', 'id'), (SELECT COALESCE(MAX(id), 1) FROM warehouses));
        SELECT setval(pg_get_serial_sequence('suppliers', 'id'), (SELECT COALESCE(MAX(id), 1) FROM suppliers));
        SELECT setval(pg_get_serial_sequence('customers', 'id'), (SELECT COALESCE(MAX(id), 1) FROM customers));
        SELECT setval(pg_get_serial_sequence('raw_materials', 'id'), (SELECT COALESCE(MAX(id), 1) FROM raw_materials));
        SELECT setval(pg_get_serial_sequence('branches', 'id'), (SELECT COALESCE(MAX(id), 1) FROM branches));
        SELECT setval(pg_get_serial_sequence('recipes', 'id'), (SELECT COALESCE(MAX(id), 1) FROM recipes));
      `);
    } catch (error) {
      initPromise = null;
      console.error('[PostgreSQL] Database initialization/migration failure:', error);
      throw error;
    } finally {
      client.release();
    }
  })();

  return initPromise;
};
