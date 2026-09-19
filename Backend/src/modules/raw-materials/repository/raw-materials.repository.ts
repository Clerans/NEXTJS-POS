import { pool } from '../../../config/db.js';
import {
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
  RawMaterialResponseDto,
  CreateRawMaterialBatchDto,
  RawMaterialBatchResponseDto,
  RawMaterialInventoryResponseDto,
  AdjustRawMaterialStockDto,
} from '../dto/raw-materials.dto.js';

export class RawMaterialRepository {
  private mapRowToDto(row: any): RawMaterialResponseDto {
    return {
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      unitId: row.unit_id ? parseInt(row.unit_id, 10) : null,
      unitName: row.unit_name || null,
      unitAbbr: row.unit_abbr || null,
      costPerUnit: parseFloat(row.cost_per_unit || '0'),
      reorderLevel: parseFloat(row.reorder_level || '10'),
      isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
      createdAt: row.created_at,
    };
  }

  async findAll(): Promise<RawMaterialResponseDto[]> {
    const result = await pool.query(
      `SELECT r.id, r.code, r.name, r.unit_id, r.cost_per_unit, r.reorder_level, r.created_at,
              u.name as unit_name, u.abbreviation as unit_abbr
       FROM raw_materials r
       LEFT JOIN units u ON r.unit_id = u.id
       ORDER BY r.id ASC`
    );

    return result.rows.map((row: any) => this.mapRowToDto(row));
  }

  async findById(id: number): Promise<RawMaterialResponseDto | null> {
    const result = await pool.query(
      `SELECT r.id, r.code, r.name, r.unit_id, r.cost_per_unit, r.reorder_level, r.created_at,
              u.name as unit_name, u.abbreviation as unit_abbr
       FROM raw_materials r
       LEFT JOIN units u ON r.unit_id = u.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToDto(result.rows[0]);
  }

  async findByCode(code: string): Promise<RawMaterialResponseDto | null> {
    const result = await pool.query(
      `SELECT r.id, r.code, r.name, r.unit_id, r.cost_per_unit, r.reorder_level, r.created_at,
              u.name as unit_name, u.abbreviation as unit_abbr
       FROM raw_materials r
       LEFT JOIN units u ON r.unit_id = u.id
       WHERE LOWER(r.code) = LOWER($1)`,
      [code]
    );

    if (result.rows.length === 0) return null;
    return this.mapRowToDto(result.rows[0]);
  }

  async create(dto: CreateRawMaterialDto): Promise<RawMaterialResponseDto> {
    const result = await pool.query(
      `INSERT INTO raw_materials (code, name, unit_id, cost_per_unit, reorder_level)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        dto.code,
        dto.name,
        dto.unitId || null,
        dto.costPerUnit,
        dto.reorderLevel !== undefined ? dto.reorderLevel : 10.0,
      ]
    );

    const createdId = parseInt(result.rows[0].id, 10);
    const created = await this.findById(createdId);
    if (!created) {
      throw new Error(`Failed to retrieve newly created raw material ID ${createdId}`);
    }
    return created;
  }

  async update(id: number, dto: UpdateRawMaterialDto): Promise<RawMaterialResponseDto | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const code = dto.code !== undefined ? dto.code : existing.code;
    const name = dto.name !== undefined ? dto.name : existing.name;
    const unitId = dto.unitId !== undefined ? dto.unitId : existing.unitId;
    const costPerUnit = dto.costPerUnit !== undefined ? dto.costPerUnit : existing.costPerUnit;
    const reorderLevel = dto.reorderLevel !== undefined ? dto.reorderLevel : existing.reorderLevel;

    await pool.query(
      `UPDATE raw_materials
       SET code = $1, name = $2, unit_id = $3, cost_per_unit = $4, reorder_level = $5
       WHERE id = $6`,
      [code, name, unitId, costPerUnit, reorderLevel, id]
    );

    return await this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM raw_materials WHERE id = $1 RETURNING id`, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // --- BATCHES & INVENTORY EXTENSIONS ---

  async findBatches(
    rawMaterialId?: number,
    warehouseId?: number
  ): Promise<RawMaterialBatchResponseDto[]> {
    let sql = `
      SELECT b.id, b.raw_material_id, r.name as raw_material_name,
             b.warehouse_id, w.name as warehouse_name,
             b.batch_number, b.quantity, b.unit_cost, b.expiry_date, b.created_at
      FROM raw_material_batches b
      JOIN raw_materials r ON b.raw_material_id = r.id
      LEFT JOIN warehouses w ON b.warehouse_id = w.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (rawMaterialId) {
      params.push(rawMaterialId);
      conditions.push(`b.raw_material_id = $${params.length}`);
    }
    if (warehouseId) {
      params.push(warehouseId);
      conditions.push(`b.warehouse_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY b.id DESC';

    const result = await pool.query(sql, params);
    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      rawMaterialId: parseInt(row.raw_material_id, 10),
      rawMaterialName: row.raw_material_name || null,
      warehouseId: parseInt(row.warehouse_id, 10),
      warehouseName: row.warehouse_name || null,
      batchNumber: row.batch_number,
      quantity: parseFloat(row.quantity),
      unitCost: parseFloat(row.unit_cost),
      expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
      createdAt: row.created_at,
    }));
  }

  async createBatch(dto: CreateRawMaterialBatchDto): Promise<RawMaterialBatchResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const batchRes = await client.query(
        `INSERT INTO raw_material_batches (raw_material_id, warehouse_id, batch_number, quantity, unit_cost, expiry_date)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, created_at`,
        [
          dto.rawMaterialId,
          dto.warehouseId,
          dto.batchNumber,
          dto.quantity,
          dto.unitCost,
          dto.expiryDate || null,
        ]
      );

      // Upsert into raw_material_inventory
      await client.query(
        `INSERT INTO raw_material_inventory (warehouse_id, raw_material_id, current_stock, reorder_level)
         VALUES ($1, $2, $3, COALESCE((SELECT reorder_level FROM raw_materials WHERE id = $2), 10.00))
         ON CONFLICT (warehouse_id, raw_material_id)
         DO UPDATE SET current_stock = raw_material_inventory.current_stock + EXCLUDED.current_stock,
                       updated_at = CURRENT_TIMESTAMP`,
        [dto.warehouseId, dto.rawMaterialId, dto.quantity]
      );

      await client.query('COMMIT');

      const batchId = parseInt(batchRes.rows[0].id, 10);
      const batches = await this.findBatches();
      const created = batches.find((b) => b.id === batchId);
      if (!created) {
        throw new Error(`Failed to retrieve newly created batch ID ${batchId}`);
      }
      return created;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async findInventory(
    rawMaterialId?: number,
    warehouseId?: number
  ): Promise<RawMaterialInventoryResponseDto[]> {
    let sql = `
      SELECT i.id, i.warehouse_id, w.name as warehouse_name,
             i.raw_material_id, r.name as raw_material_name,
             i.current_stock, i.reorder_level, i.updated_at
      FROM raw_material_inventory i
      JOIN raw_materials r ON i.raw_material_id = r.id
      LEFT JOIN warehouses w ON i.warehouse_id = w.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (rawMaterialId) {
      params.push(rawMaterialId);
      conditions.push(`i.raw_material_id = $${params.length}`);
    }
    if (warehouseId) {
      params.push(warehouseId);
      conditions.push(`i.warehouse_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    sql += ' ORDER BY i.id DESC';

    const result = await pool.query(sql, params);
    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      warehouseId: parseInt(row.warehouse_id, 10),
      warehouseName: row.warehouse_name || null,
      rawMaterialId: parseInt(row.raw_material_id, 10),
      rawMaterialName: row.raw_material_name || null,
      currentStock: parseFloat(row.current_stock),
      reorderLevel: parseFloat(row.reorder_level),
      updatedAt: row.updated_at,
    }));
  }

  async adjustStock(dto: AdjustRawMaterialStockDto): Promise<RawMaterialInventoryResponseDto> {
    const result = await pool.query(
      `INSERT INTO raw_material_inventory (warehouse_id, raw_material_id, current_stock, reorder_level)
       VALUES ($1, $2, $3, COALESCE((SELECT reorder_level FROM raw_materials WHERE id = $2), 10.00))
       ON CONFLICT (warehouse_id, raw_material_id)
       DO UPDATE SET current_stock = EXCLUDED.current_stock,
                     updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [dto.warehouseId, dto.rawMaterialId, dto.newQuantity]
    );

    const invId = parseInt(result.rows[0].id, 10);
    const list = await this.findInventory();
    const item = list.find((i) => i.id === invId);
    if (!item) {
      throw new Error(`Failed to retrieve inventory record ID ${invId}`);
    }
    return item;
  }
}
