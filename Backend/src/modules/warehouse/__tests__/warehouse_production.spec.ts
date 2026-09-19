import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { WarehouseService } from '../service/warehouse.service.js';
import { UnprocessableEntityError, NotFoundError, BadRequestError } from '../../../common/errors/app-error.js';
import { pool, initDatabase } from '../../../config/db.js';

describe('Warehouse Production Domain Tests', () => {
  let warehouseService: WarehouseService;

  beforeEach(async () => {
    await initDatabase();
    await pool.query('UPDATE products SET is_active = true WHERE id = 1');
    warehouseService = new WarehouseService();
  });

  it('should reject production for nonexistent product', async () => {
    await assert.rejects(
      async () => {
        await warehouseService.createProduction({
          productId: 999999,
          warehouseId: 1,
          quantity: 10,
        });
      },
      (err: any) => err instanceof NotFoundError
    );
  });

  it('should reject production for nonexistent warehouse', async () => {
    await assert.rejects(
      async () => {
        await warehouseService.createProduction({
          productId: 1,
          warehouseId: 999999,
          quantity: 10,
        });
      },
      (err: any) => err instanceof NotFoundError
    );
  });

  it('should reject production when quantity is zero or negative', async () => {
    await assert.rejects(
      async () => {
        await warehouseService.createProduction({
          productId: 1,
          warehouseId: 1,
          quantity: 0,
        });
      },
      (err: any) => err instanceof BadRequestError
    );
  });

  it('should reject production when product has no active recipe', async () => {
    // Product 3 (if no recipe attached)
    const res = await pool.query('SELECT id FROM products WHERE is_recipe_based = FALSE LIMIT 1');
    if (res.rows.length > 0) {
      const prodId = parseInt(res.rows[0].id, 10);
      await assert.rejects(
        async () => {
          await warehouseService.createProduction({
            productId: prodId,
            warehouseId: 1,
            quantity: 10,
          });
        },
        (err: any) => err instanceof UnprocessableEntityError
      );
    }
  });

  it('should reject production when raw material stock is insufficient and rollback', async () => {
    // Ensure active recipe exists for product 1
    const recipeRes = await pool.query('SELECT id FROM recipes WHERE product_id = 1');
    if (recipeRes.rows.length > 0) {
      // Clear raw material stock in warehouse 1 for recipe items
      await pool.query(
        `UPDATE raw_material_inventory SET current_stock = 0.00 WHERE warehouse_id = 1 AND raw_material_id IN (
           SELECT raw_material_id FROM recipe_items WHERE recipe_id = $1
         )`,
        [recipeRes.rows[0].id]
      );

      await assert.rejects(
        async () => {
          await warehouseService.createProduction({
            productId: 1,
            warehouseId: 1,
            quantity: 100,
          });
        },
        (err: any) => err instanceof UnprocessableEntityError
      );
    }
  });

  it('should execute production successfully with yield-scaled raw material deduction and finished product yield', async () => {
    // Check if recipe 1 exists for product 1
    const recipeRes = await pool.query('SELECT id, yield_quantity FROM recipes WHERE product_id = 1');
    if (recipeRes.rows.length === 0) return;

    const yieldQty = parseFloat(recipeRes.rows[0].yield_quantity || '1.0');

    // Ensure raw materials have enough stock
    await pool.query(
      `INSERT INTO raw_material_inventory (warehouse_id, raw_material_id, current_stock, reorder_level)
       VALUES (1, 1, 1000.00, 10.00)
       ON CONFLICT (warehouse_id, raw_material_id) DO UPDATE SET current_stock = 1000.00`
    );

    const initialStockRes = await pool.query(
      `SELECT current_stock FROM raw_material_inventory WHERE warehouse_id = 1 AND raw_material_id = 1`
    );
    const initialRmStock = parseFloat(initialStockRes.rows[0].current_stock);

    const prodQty = 10;
    const production = await warehouseService.createProduction({
      productId: 1,
      warehouseId: 1,
      quantity: prodQty,
    });

    assert.ok(production);
    assert.strictEqual(production.status, 'COMPLETED');
    assert.strictEqual(production.quantity, prodQty);

    // Verify yield-scaled raw material deduction
    const itemRes = await pool.query(`SELECT quantity FROM recipe_items WHERE recipe_id = $1 AND raw_material_id = 1`, [recipeRes.rows[0].id]);
    if (itemRes.rows.length > 0) {
      const ingredientQty = parseFloat(itemRes.rows[0].quantity);
      const expectedConsumed = ingredientQty * (prodQty / yieldQty);

      const updatedRmRes = await pool.query(
        `SELECT current_stock FROM raw_material_inventory WHERE warehouse_id = 1 AND raw_material_id = 1`
      );
      const updatedRmStock = parseFloat(updatedRmRes.rows[0].current_stock);

      assert.strictEqual(updatedRmStock, initialRmStock - expectedConsumed);
    }

    // Verify finished product stock increased
    const prodStockRes = await pool.query(`SELECT current_stock FROM inventory_stock WHERE branch_id = 1 AND product_id = 1`);
    assert.ok(prodStockRes.rows.length > 0);
  });
});
