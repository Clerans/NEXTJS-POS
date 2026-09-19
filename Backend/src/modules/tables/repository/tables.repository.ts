import { pool } from '../../../config/db.js';
import {
  CreateDiningTableDto,
  UpdateDiningTableDto,
  DiningTableResponseDto,
} from '../dto/tables.dto.js';

export class DiningTableRepository {
  async findAll(branchId?: number): Promise<DiningTableResponseDto[]> {
    let query = `
      SELECT t.id, t.branch_id AS "branchId", b.name AS "branchName",
             t.table_number AS "tableNumber", t.capacity, t.availability,
             t.is_active AS "isActive", t.created_at AS "createdAt", t.updated_at AS "updatedAt"
      FROM restaurant_tables t
      LEFT JOIN branches b ON t.branch_id = b.id
    `;
    const params: any[] = [];

    if (branchId) {
      query += ` WHERE t.branch_id = $1`;
      params.push(branchId);
    }

    query += ` ORDER BY t.table_number ASC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<DiningTableResponseDto | null> {
    const query = `
      SELECT t.id, t.branch_id AS "branchId", b.name AS "branchName",
             t.table_number AS "tableNumber", t.capacity, t.availability,
             t.is_active AS "isActive", t.created_at AS "createdAt", t.updated_at AS "updatedAt"
      FROM restaurant_tables t
      LEFT JOIN branches b ON t.branch_id = b.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByBranchAndNumber(branchId: number, tableNumber: string): Promise<DiningTableResponseDto | null> {
    const query = `
      SELECT id, branch_id AS "branchId", table_number AS "tableNumber"
      FROM restaurant_tables
      WHERE branch_id = $1 AND LOWER(table_number) = LOWER($2)
    `;
    const result = await pool.query(query, [branchId, tableNumber]);
    return result.rows[0] || null;
  }

  async create(dto: CreateDiningTableDto): Promise<DiningTableResponseDto> {
    const query = `
      INSERT INTO restaurant_tables (branch_id, table_number, capacity, availability, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, branch_id AS "branchId", table_number AS "tableNumber", capacity,
                availability, is_active AS "isActive", created_at AS "createdAt", updated_at AS "updatedAt"
    `;
    const values = [
      dto.branchId,
      dto.tableNumber,
      dto.capacity ?? 4,
      dto.availability ?? 'AVAILABLE',
      dto.isActive ?? true,
    ];
    const result = await pool.query(query, values);
    const created = result.rows[0];
    const full = await this.findById(created.id);
    return full || created;
  }

  async update(id: number, dto: UpdateDiningTableDto): Promise<DiningTableResponseDto | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.branchId !== undefined) {
      fields.push(`branch_id = $${idx++}`);
      values.push(dto.branchId);
    }
    if (dto.tableNumber !== undefined) {
      fields.push(`table_number = $${idx++}`);
      values.push(dto.tableNumber);
    }
    if (dto.capacity !== undefined) {
      fields.push(`capacity = $${idx++}`);
      values.push(dto.capacity);
    }
    if (dto.availability !== undefined) {
      fields.push(`availability = $${idx++}`);
      values.push(dto.availability);
    }
    if (dto.isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(dto.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE restaurant_tables
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id
    `;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return null;
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM restaurant_tables WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }
}
