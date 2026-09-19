import { pool } from '../../../config/db.js';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
  RecipeResponseDto,
  RecipeItemDto,
} from '../dto/recipes.dto.js';

export class RecipeRepository {
  private async getRecipeItems(recipeId: number): Promise<RecipeItemDto[]> {
    const result = await pool.query(
      `SELECT ri.id, ri.raw_material_id, rm.name as raw_material_name,
              ri.quantity, ri.unit_id, u.name as unit_name, u.abbreviation as unit_abbr
       FROM recipe_items ri
       JOIN raw_materials rm ON ri.raw_material_id = rm.id
       LEFT JOIN units u ON ri.unit_id = u.id
       WHERE ri.recipe_id = $1
       ORDER BY ri.id ASC`,
      [recipeId]
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      rawMaterialId: parseInt(row.raw_material_id, 10),
      rawMaterialName: row.raw_material_name || null,
      quantity: parseFloat(row.quantity),
      unitId: row.unit_id ? parseInt(row.unit_id, 10) : null,
      unitName: row.unit_name || null,
      unitAbbr: row.unit_abbr || null,
    }));
  }

  async findAll(): Promise<RecipeResponseDto[]> {
    const result = await pool.query(
      `SELECT r.id, r.product_id, p.name as product_name,
              r.name, r.yield_quantity, r.instructions, r.is_active, r.created_at
       FROM recipes r
       LEFT JOIN products p ON r.product_id = p.id
       ORDER BY r.id ASC`
    );

    const recipes: RecipeResponseDto[] = [];
    for (const row of result.rows) {
      const items = await this.getRecipeItems(parseInt(row.id, 10));
      recipes.push({
        id: parseInt(row.id, 10),
        productId: parseInt(row.product_id, 10),
        productName: row.product_name || null,
        name: row.name,
        yieldQuantity: parseFloat(row.yield_quantity || '1.0'),
        instructions: row.instructions || null,
        isActive: Boolean(row.is_active),
        createdAt: row.created_at,
        items,
      });
    }
    return recipes;
  }

  async findById(id: number): Promise<RecipeResponseDto | null> {
    const result = await pool.query(
      `SELECT r.id, r.product_id, p.name as product_name,
              r.name, r.yield_quantity, r.instructions, r.is_active, r.created_at
       FROM recipes r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const items = await this.getRecipeItems(id);

    return {
      id: parseInt(row.id, 10),
      productId: parseInt(row.product_id, 10),
      productName: row.product_name || null,
      name: row.name,
      yieldQuantity: parseFloat(row.yield_quantity || '1.0'),
      instructions: row.instructions || null,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      items,
    };
  }

  async findByProductId(productId: number): Promise<RecipeResponseDto | null> {
    const result = await pool.query(
      `SELECT r.id, r.product_id, p.name as product_name,
              r.name, r.yield_quantity, r.instructions, r.is_active, r.created_at
       FROM recipes r
       LEFT JOIN products p ON r.product_id = p.id
       WHERE r.product_id = $1`,
      [productId]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    const recipeId = parseInt(row.id, 10);
    const items = await this.getRecipeItems(recipeId);

    return {
      id: recipeId,
      productId: parseInt(row.product_id, 10),
      productName: row.product_name || null,
      name: row.name,
      yieldQuantity: parseFloat(row.yield_quantity || '1.0'),
      instructions: row.instructions || null,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      items,
    };
  }

  async create(dto: CreateRecipeDto): Promise<RecipeResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const recipeRes = await client.query(
        `INSERT INTO recipes (product_id, name, yield_quantity, instructions, is_active)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          dto.productId,
          dto.name,
          dto.yieldQuantity !== undefined ? dto.yieldQuantity : 1.0,
          dto.instructions || null,
          dto.isActive !== undefined ? dto.isActive : true,
        ]
      );

      const recipeId = parseInt(recipeRes.rows[0].id, 10);

      for (const item of dto.items) {
        await client.query(
          `INSERT INTO recipe_items (recipe_id, raw_material_id, quantity, unit_id)
           VALUES ($1, $2, $3, $4)`,
          [recipeId, item.rawMaterialId, item.quantity, item.unitId || null]
        );
      }

      // Mark product as recipe based
      await client.query(`UPDATE products SET is_recipe_based = TRUE WHERE id = $1`, [dto.productId]);

      await client.query('COMMIT');

      const created = await this.findById(recipeId);
      if (!created) {
        throw new Error(`Failed to retrieve newly created recipe ID ${recipeId}`);
      }
      return created;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async update(id: number, dto: UpdateRecipeDto): Promise<RecipeResponseDto | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const productId = dto.productId !== undefined ? dto.productId : existing.productId;
      const name = dto.name !== undefined ? dto.name : existing.name;
      const yieldQuantity = dto.yieldQuantity !== undefined ? dto.yieldQuantity : existing.yieldQuantity;
      const instructions = dto.instructions !== undefined ? dto.instructions : existing.instructions;
      const isActive = dto.isActive !== undefined ? dto.isActive : existing.isActive;

      await client.query(
        `UPDATE recipes
         SET product_id = $1, name = $2, yield_quantity = $3, instructions = $4, is_active = $5
         WHERE id = $6`,
        [productId, name, yieldQuantity, instructions, isActive, id]
      );

      if (dto.items) {
        await client.query(`DELETE FROM recipe_items WHERE recipe_id = $1`, [id]);
        for (const item of dto.items) {
          await client.query(
            `INSERT INTO recipe_items (recipe_id, raw_material_id, quantity, unit_id)
             VALUES ($1, $2, $3, $4)`,
            [id, item.rawMaterialId, item.quantity, item.unitId || null]
          );
        }
      }

      await client.query('COMMIT');

      return await this.findById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM recipes WHERE id = $1`, [id]);
      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
}
