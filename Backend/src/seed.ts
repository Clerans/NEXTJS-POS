import bcrypt from 'bcryptjs';
import { pool, initDatabase } from './config/db.js';
import { config } from './config/env.js';

export const seedDevelopmentData = async () => {
  console.log('[Seed] Starting development seed process...');
  await initDatabase();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed Core Reference Data (Warehouses, Categories, Units, Products)
    await client.query(`
      INSERT INTO warehouses (id, code, name, location, branch_id) VALUES
        (1, 'WH-001', 'Central Distribution Hub', 'Colombo Industrial Zone', 1)
      ON CONFLICT (code) DO NOTHING;

      INSERT INTO categories (id, name) VALUES
        (1, 'Beverages & Coffee'),
        (2, 'Bakery & Pastries'),
        (3, 'Desserts')
      ON CONFLICT (name) DO NOTHING;

      INSERT INTO units (id, name, abbreviation) VALUES
        (1, 'Pieces', 'PCS'),
        (2, 'Boxes', 'BOX'),
        (3, 'Kilograms', 'KG'),
        (4, 'Liters', 'L'),
        (5, 'Grams', 'G')
      ON CONFLICT (abbreviation) DO NOTHING;

      INSERT INTO products (id, sku, barcode, name, category_id, unit_id, retail_price, cost_price, is_recipe_based, reorder_level, is_active) VALUES
        (1, 'PRD-ESP-001', '890123456001', 'Single Espresso Shot', 1, 1, 450.00, 150.00, true, 10.00, true),
        (2, 'PRD-CAP-002', '890123456002', 'Double Cappuccino', 1, 1, 650.00, 220.00, true, 10.00, true),
        (3, 'PRD-CRN-003', '890123456003', 'Butter Croissant', 2, 1, 380.00, 180.00, false, 15.00, true)
      ON CONFLICT (sku) DO NOTHING;
    `);

    // 2. Seed Roles & Users
    const hashedPass = await bcrypt.hash(config.adminInitialPassword, 10);
    const hashedPin = await bcrypt.hash(config.adminInitialPin, 10);

    await client.query(`
      INSERT INTO users (id, username, password, name, role, must_change_password, pin_code_hash, email) VALUES
        (1, 'admin', '${hashedPass}', 'NEXUS Administrator', 'ADMINISTRATOR', false, '${hashedPin}', 'admin@nexuspos.com'),
        (2, 'manager_kandy', '${hashedPass}', 'Kandy Branch Manager', 'MANAGER', false, '${hashedPin}', 'kandy.mgr@nexuspos.com'),
        (3, 'cashier_colombo', '${hashedPass}', 'Colombo Cashier', 'CASHIER', false, '${hashedPin}', 'cashier1@nexuspos.com')
      ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, pin_code_hash = EXCLUDED.pin_code_hash;
    `);

    // Assign user branch access
    await client.query(`
      INSERT INTO user_branches (user_id, branch_id) VALUES
        (1, 1), (1, 2), (1, 3),
        (2, 2),
        (3, 1)
      ON CONFLICT DO NOTHING;
    `);

    // 3. Seed Raw Materials
    await client.query(`
      INSERT INTO raw_materials (id, code, name, unit_id, cost_per_unit, reorder_level) VALUES
        (1, 'RM-COF-001', 'Arabica Coffee Beans (kg)', 3, 3500.00, 10.00),
        (2, 'RM-MLK-002', 'Fresh Whole Milk (L)', 4, 420.00, 20.00),
        (3, 'RM-SGR-003', 'White Refined Sugar (kg)', 3, 280.00, 15.00),
        (4, 'RM-FLR-004', 'Baker Flour (kg)', 3, 310.00, 25.00)
      ON CONFLICT (code) DO NOTHING;
    `);

    // 3. Seed Recipes & Recipe Items
    await client.query(`
      INSERT INTO recipes (id, product_id, name, yield_quantity, instructions) VALUES
        (1, 1, 'Espresso Single Shot Recipe', 1.00, 'Extract 18g finely ground coffee at 9 bar pressure for 25s.'),
        (2, 2, 'Cappuccino Double Recipe', 1.00, 'Extract double espresso shot and steam 180ml whole milk to velvet foam.')
      ON CONFLICT (product_id) DO NOTHING;

      INSERT INTO recipe_items (recipe_id, raw_material_id, quantity, unit_id) VALUES
        (1, 1, 0.0180, 3), -- 18g coffee
        (2, 1, 0.0180, 3), -- 18g coffee
        (2, 2, 0.1800, 4)  -- 180ml milk
      ON CONFLICT (recipe_id, raw_material_id) DO NOTHING;
    `);

    // 4. Seed Product Price Tiers
    await client.query(`
      INSERT INTO product_prices (product_id, branch_id, price_tier, price) VALUES
        (1, 1, 'OUTLET', 450.00),
        (1, 1, 'PICKME', 520.00),
        (1, 1, 'UBER', 520.00),
        (2, 1, 'OUTLET', 650.00),
        (2, 1, 'PICKME', 750.00),
        (2, 1, 'UBER', 750.00)
      ON CONFLICT (product_id, branch_id, price_tier) DO NOTHING;
    `);

    // 5. Seed Raw Material Batches
    await client.query(`
      INSERT INTO raw_material_batches (raw_material_id, warehouse_id, batch_number, quantity, unit_cost, expiry_date) VALUES
        (1, 1, 'BATCH-COF-2026-01', 50.00, 3500.00, '2026-12-31'),
        (2, 1, 'BATCH-MLK-2026-08', 100.00, 420.00, '2026-08-25')
      ON CONFLICT DO NOTHING;
    `);

    await client.query('COMMIT');
    console.log('[Seed] Development seed data populated cleanly.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Seed] Failed to execute seed:', error);
    throw error;
  } finally {
    client.release();
  }
};

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDevelopmentData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
