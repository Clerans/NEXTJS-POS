import { pool } from '../../../config/db.js';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CreateUnitDto,
  UpdateUnitDto,
  UnitResponseDto,
} from '../dto/products.dto.js';
import { ConflictError } from '../../../common/errors/app-error.js';

export class ProductRepository {
  async findAll(): Promise<ProductResponseDto[]> {
    const result = await pool.query(
      `SELECT p.id, p.sku, p.barcode, p.name, p.retail_price, p.cost_price, p.is_recipe_based, p.reorder_level, p.is_active, p.created_at,
              c.id as category_id, c.name as category_name,
              u.id as unit_id, u.name as unit_name, u.abbreviation as unit_abbr
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN units u ON p.unit_id = u.id
       ORDER BY p.id ASC`
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      sku: row.sku,
      barcode: row.barcode || null,
      name: row.name,
      category: {
        id: parseInt(row.category_id || '1', 10),
        name: row.category_name || 'General',
      },
      unit: {
        id: parseInt(row.unit_id || '1', 10),
        name: row.unit_name || 'Pieces',
        abbreviation: row.unit_abbr || 'pcs',
      },
      retailPrice: parseFloat(row.retail_price),
      costPrice: parseFloat(row.cost_price),
      isRecipeBased: row.is_recipe_based,
      reorderLevel: parseFloat(row.reorder_level),
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  async findById(id: number): Promise<ProductResponseDto | null> {
    const result = await pool.query(
      `SELECT p.id, p.sku, p.barcode, p.name, p.retail_price, p.cost_price, p.is_recipe_based, p.reorder_level, p.is_active, p.created_at,
              c.id as category_id, c.name as category_name,
              u.id as unit_id, u.name as unit_name, u.abbreviation as unit_abbr
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN units u ON p.unit_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      sku: row.sku,
      barcode: row.barcode || null,
      name: row.name,
      category: { id: parseInt(row.category_id || '1', 10), name: row.category_name || 'General' },
      unit: { id: parseInt(row.unit_id || '1', 10), name: row.unit_name || 'Pieces', abbreviation: row.unit_abbr || 'pcs' },
      retailPrice: parseFloat(row.retail_price),
      costPrice: parseFloat(row.cost_price),
      isRecipeBased: row.is_recipe_based,
      reorderLevel: parseFloat(row.reorder_level),
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  async findBySku(sku: string): Promise<ProductResponseDto | null> {
    const result = await pool.query(
      `SELECT p.id, p.sku, p.barcode, p.name, p.retail_price, p.cost_price, p.is_recipe_based, p.reorder_level, p.is_active, p.created_at,
              c.id as category_id, c.name as category_name,
              u.id as unit_id, u.name as unit_name, u.abbreviation as unit_abbr
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN units u ON p.unit_id = u.id
       WHERE LOWER(p.sku) = LOWER($1)
       LIMIT 1`,
      [sku]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      sku: row.sku,
      barcode: row.barcode || null,
      name: row.name,
      category: { id: parseInt(row.category_id || '1', 10), name: row.category_name || 'General' },
      unit: { id: parseInt(row.unit_id || '1', 10), name: row.unit_name || 'Pieces', abbreviation: row.unit_abbr || 'pcs' },
      retailPrice: parseFloat(row.retail_price),
      costPrice: parseFloat(row.cost_price),
      isRecipeBased: row.is_recipe_based,
      reorderLevel: parseFloat(row.reorder_level),
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO products (sku, barcode, name, category_id, unit_id, retail_price, cost_price, is_recipe_based, reorder_level, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
         RETURNING id, created_at`,
        [
          dto.sku,
          dto.barcode || null,
          dto.name,
          dto.categoryId || 1,
          dto.unitId || 1,
          dto.retailPrice,
          dto.costPrice,
          dto.isRecipeBased || false,
          dto.reorderLevel || 10,
        ]
      );

      const newId = parseInt(result.rows[0].id, 10);
      const createdAt = result.rows[0].created_at;

      // Seed initial stock row with zero inventory (no phantom stock)
      await client.query(
        `INSERT INTO inventory_stock (branch_id, product_id, current_stock, reorder_level, status)
         VALUES (1, $1, 0.00, $2, 'OUT_OF_STOCK')`,
        [newId, dto.reorderLevel || 10]
      );

      await client.query('COMMIT');

      const catRes = await pool.query('SELECT name FROM categories WHERE id = $1', [dto.categoryId || 1]);
      const unitRes = await pool.query('SELECT name, abbreviation FROM units WHERE id = $1', [dto.unitId || 1]);

      return {
        id: newId,
        sku: dto.sku,
        barcode: dto.barcode || null,
        name: dto.name,
        category: { id: dto.categoryId || 1, name: catRes.rows[0]?.name || 'General' },
        unit: { id: dto.unitId || 1, name: unitRes.rows[0]?.name || 'Pieces', abbreviation: unitRes.rows[0]?.abbreviation || 'pcs' },
        retailPrice: dto.retailPrice,
        costPrice: dto.costPrice,
        isRecipeBased: dto.isRecipeBased || false,
        reorderLevel: dto.reorderLevel || 10,
        isActive: true,
        createdAt,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: number, dto: UpdateProductDto): Promise<ProductResponseDto | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    if (dto.sku && dto.sku.toLowerCase() !== existing.sku.toLowerCase()) {
      const checkRes = await pool.query('SELECT id FROM products WHERE LOWER(sku) = LOWER($1) AND id != $2', [
        dto.sku,
        id,
      ]);
      if (checkRes.rows.length > 0) {
        throw new ConflictError(`Product SKU '${dto.sku}' already exists`);
      }
    }

    const updatedName = dto.name !== undefined ? dto.name : existing.name;
    const updatedSku = dto.sku !== undefined ? dto.sku : existing.sku;
    const updatedBarcode = dto.barcode !== undefined ? dto.barcode : existing.barcode;
    const updatedCatId = dto.categoryId !== undefined ? dto.categoryId : existing.category.id;
    const updatedUnitId = dto.unitId !== undefined ? dto.unitId : existing.unit.id;
    const updatedRetailPrice = dto.retailPrice !== undefined ? dto.retailPrice : existing.retailPrice;
    const updatedCostPrice = dto.costPrice !== undefined ? dto.costPrice : existing.costPrice;
    const updatedIsRecipe = dto.isRecipeBased !== undefined ? dto.isRecipeBased : existing.isRecipeBased;
    const updatedReorderLevel = dto.reorderLevel !== undefined ? dto.reorderLevel : existing.reorderLevel;
    const updatedIsActive = dto.isActive !== undefined ? dto.isActive : existing.isActive;

    await pool.query(
      `UPDATE products 
       SET name = $1, sku = $2, barcode = $3, category_id = $4, unit_id = $5, retail_price = $6, cost_price = $7, is_recipe_based = $8, reorder_level = $9, is_active = $10 
       WHERE id = $11`,
      [
        updatedName,
        updatedSku,
        updatedBarcode,
        updatedCatId,
        updatedUnitId,
        updatedRetailPrice,
        updatedCostPrice,
        updatedIsRecipe,
        updatedReorderLevel,
        updatedIsActive,
        id,
      ]
    );

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // --- CATEGORY CRUD METHODS ---

  async findAllCategories(): Promise<CategoryResponseDto[]> {
    const query = `
      SELECT 
        c.id,
        c.name,
        COALESCE(c.status, 'Active') AS status,
        COUNT(p.id) AS product_count,
        c.created_at
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.status, c.created_at
      ORDER BY c.id ASC
    `;
    const res = await pool.query(query);

    return res.rows.map(row => {
      const pCount = parseInt(row.product_count || '0', 10);
      return {
        id: parseInt(row.id, 10),
        name: row.name,
        count: `${pCount} items`,
        productCount: pCount,
        status: row.status === 'Inactive' ? 'Inactive' : 'Active',
        createdAt: row.created_at,
      };
    });
  }

  async findCategoryById(id: number): Promise<CategoryResponseDto | null> {
    const query = `
      SELECT 
        c.id,
        c.name,
        COALESCE(c.status, 'Active') AS status,
        COUNT(p.id) AS product_count,
        c.created_at
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.status, c.created_at
    `;
    const res = await pool.query(query, [id]);
    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    const pCount = parseInt(row.product_count || '0', 10);
    return {
      id: parseInt(row.id, 10),
      name: row.name,
      count: `${pCount} items`,
      productCount: pCount,
      status: row.status === 'Inactive' ? 'Inactive' : 'Active',
      createdAt: row.created_at,
    };
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    // Check duplicate
    const checkRes = await pool.query('SELECT id FROM categories WHERE LOWER(name) = LOWER($1)', [dto.name]);
    if (checkRes.rows.length > 0) {
      throw new ConflictError(`Category with name "${dto.name}" already exists`);
    }

    const res = await pool.query(
      'INSERT INTO categories (name, status) VALUES ($1, $2) RETURNING id, created_at',
      [dto.name, dto.status || 'Active']
    );

    const row = res.rows[0];
    return {
      id: parseInt(row.id, 10),
      name: dto.name,
      count: '0 items',
      productCount: 0,
      status: (dto.status || 'Active') as 'Active' | 'Inactive',
      createdAt: row.created_at,
    };
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<CategoryResponseDto | null> {
    const existing = await this.findCategoryById(id);
    if (!existing) return null;

    if (dto.name && dto.name.toLowerCase() !== existing.name.toLowerCase()) {
      const checkRes = await pool.query('SELECT id FROM categories WHERE LOWER(name) = LOWER($1) AND id != $2', [
        dto.name,
        id,
      ]);
      if (checkRes.rows.length > 0) {
        throw new ConflictError(`Category with name "${dto.name}" already exists`);
      }
    }

    const updatedName = dto.name !== undefined ? dto.name : existing.name;
    const updatedStatus = dto.status !== undefined ? dto.status : existing.status;

    await pool.query('UPDATE categories SET name = $1, status = $2 WHERE id = $3', [updatedName, updatedStatus, id]);

    return await this.findCategoryById(id);
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // --- UNIT CRUD METHODS ---

  async findAllUnits(): Promise<UnitResponseDto[]> {
    const res = await pool.query(
      `SELECT id, name, abbreviation, COALESCE(type, 'Quantity') as type, COALESCE(status, 'Active') as status, COALESCE(icon, '📦') as icon, created_at
       FROM units
       ORDER BY id ASC`
    );

    return res.rows.map(row => ({
      id: parseInt(row.id, 10),
      name: row.name,
      abbr: row.abbreviation,
      type: row.type as 'Quantity' | 'Weight' | 'Volume',
      status: row.status as 'Active' | 'Inactive',
      icon: row.icon || '📦',
      createdAt: row.created_at,
    }));
  }

  async findUnitById(id: number): Promise<UnitResponseDto | null> {
    const res = await pool.query(
      `SELECT id, name, abbreviation, COALESCE(type, 'Quantity') as type, COALESCE(status, 'Active') as status, COALESCE(icon, '📦') as icon, created_at
       FROM units
       WHERE id = $1`,
      [id]
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    return {
      id: parseInt(row.id, 10),
      name: row.name,
      abbr: row.abbreviation,
      type: row.type as 'Quantity' | 'Weight' | 'Volume',
      status: row.status as 'Active' | 'Inactive',
      icon: row.icon || '📦',
      createdAt: row.created_at,
    };
  }

  async createUnit(dto: CreateUnitDto): Promise<UnitResponseDto> {
    const checkAbbr = await pool.query('SELECT id FROM units WHERE LOWER(abbreviation) = LOWER($1)', [dto.abbr]);
    if (checkAbbr.rows.length > 0) {
      throw new ConflictError(`Unit abbreviation '${dto.abbr}' already exists`);
    }

    let defaultIcon = '📦';
    if (dto.type === 'Weight') defaultIcon = '⚖️';
    if (dto.type === 'Volume') defaultIcon = '🥤';
    const icon = dto.icon || defaultIcon;

    const res = await pool.query(
      `INSERT INTO units (name, abbreviation, type, status, icon)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, created_at`,
      [dto.name, dto.abbr, dto.type || 'Quantity', dto.status || 'Active', icon]
    );

    const row = res.rows[0];
    return {
      id: parseInt(row.id, 10),
      name: dto.name,
      abbr: dto.abbr,
      type: (dto.type || 'Quantity') as 'Quantity' | 'Weight' | 'Volume',
      status: (dto.status || 'Active') as 'Active' | 'Inactive',
      icon,
      createdAt: row.created_at,
    };
  }

  async updateUnit(id: number, dto: UpdateUnitDto): Promise<UnitResponseDto | null> {
    const existing = await this.findUnitById(id);
    if (!existing) return null;

    if (dto.abbr && dto.abbr.toLowerCase() !== existing.abbr.toLowerCase()) {
      const checkRes = await pool.query('SELECT id FROM units WHERE LOWER(abbreviation) = LOWER($1) AND id != $2', [
        dto.abbr,
        id,
      ]);
      if (checkRes.rows.length > 0) {
        throw new ConflictError(`Unit abbreviation '${dto.abbr}' already exists`);
      }
    }

    const updatedName = dto.name !== undefined ? dto.name : existing.name;
    const updatedAbbr = dto.abbr !== undefined ? dto.abbr : existing.abbr;
    const updatedType = dto.type !== undefined ? dto.type : existing.type;
    const updatedStatus = dto.status !== undefined ? dto.status : existing.status;
    let updatedIcon = dto.icon !== undefined ? dto.icon : existing.icon;

    if (!dto.icon && dto.type) {
      if (dto.type === 'Quantity') updatedIcon = '📦';
      if (dto.type === 'Weight') updatedIcon = '⚖️';
      if (dto.type === 'Volume') updatedIcon = '🥤';
    }

    await pool.query(
      'UPDATE units SET name = $1, abbreviation = $2, type = $3, status = $4, icon = $5 WHERE id = $6',
      [updatedName, updatedAbbr, updatedType, updatedStatus, updatedIcon, id]
    );

    return await this.findUnitById(id);
  }

  async deleteUnit(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM units WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
