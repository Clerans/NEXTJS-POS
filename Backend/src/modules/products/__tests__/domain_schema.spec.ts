import { describe, it } from 'node:test';
import assert from 'node:assert';
import { pool } from '../../../config/db.js';

describe('Domain Model & Database Schema Verification', () => {
  it('should verify organization hierarchy (branches, warehouses, pos_terminals)', async () => {
    const resBranches = await pool.query('SELECT COUNT(*) FROM branches');
    const resWarehouses = await pool.query('SELECT COUNT(*) FROM warehouses');
    const resTerminals = await pool.query('SELECT COUNT(*) FROM pos_terminals');

    assert.ok(parseInt(resBranches.rows[0].count, 10) >= 3);
    assert.ok(parseInt(resWarehouses.rows[0].count, 10) >= 1);
    assert.ok(parseInt(resTerminals.rows[0].count, 10) >= 1);
  });

  it('should verify product price tiers structure', async () => {
    const resPrices = await pool.query(`
      SELECT pp.id, p.name as product_name, pp.price_tier, pp.price
      FROM product_prices pp
      JOIN products p ON pp.product_id = p.id
    `);

    assert.ok(Array.isArray(resPrices.rows));
  });

  it('should verify raw materials and raw material batches schema', async () => {
    const resMat = await pool.query('SELECT COUNT(*) FROM raw_materials');
    const resBatches = await pool.query('SELECT COUNT(*) FROM raw_material_batches');

    assert.ok(parseInt(resMat.rows[0].count, 10) >= 1);
    assert.ok(parseInt(resBatches.rows[0].count, 10) >= 1);
  });

  it('should verify recipe and recipe items relationships', async () => {
    const resRecipe = await pool.query(`
      SELECT r.id, p.name as product_name, ri.quantity, rm.name as raw_material_name
      FROM recipes r
      JOIN products p ON r.product_id = p.id
      JOIN recipe_items ri ON r.id = ri.recipe_id
      JOIN raw_materials rm ON ri.raw_material_id = rm.id
    `);

    assert.ok(resRecipe.rows.length >= 1);
  });

  it('should verify inventory adjustments structure', async () => {
    const resAdj = await pool.query('SELECT COUNT(*) FROM stock_adjustments');
    assert.ok(typeof parseInt(resAdj.rows[0].count, 10) === 'number');
  });
});
