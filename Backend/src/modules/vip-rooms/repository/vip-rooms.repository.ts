import { pool } from '../../../config/db.js';
import {
  CreateVipRoomDto,
  UpdateVipRoomDto,
  VipRoomResponseDto,
} from '../dto/vip-rooms.dto.js';

export class VipRoomRepository {
  async findAll(branchId?: number): Promise<VipRoomResponseDto[]> {
    let query = `
      SELECT r.id, r.branch_id AS "branchId", b.name AS "branchName",
             r.name, r.category, r.hourly_rate AS "hourlyRate",
             r.discount_percentage AS "discountPercentage",
             r.is_active AS "isActive", r.created_at AS "createdAt", r.updated_at AS "updatedAt"
      FROM vip_rooms r
      LEFT JOIN branches b ON r.branch_id = b.id
    `;
    const params: any[] = [];

    if (branchId) {
      query += ` WHERE r.branch_id = $1`;
      params.push(branchId);
    }

    query += ` ORDER BY r.name ASC`;

    const result = await pool.query(query, params);
    return result.rows.map((row) => ({
      ...row,
      hourlyRate: parseFloat(row.hourlyRate),
      discountPercentage: parseFloat(row.discountPercentage),
    }));
  }

  async findById(id: number): Promise<VipRoomResponseDto | null> {
    const query = `
      SELECT r.id, r.branch_id AS "branchId", b.name AS "branchName",
             r.name, r.category, r.hourly_rate AS "hourlyRate",
             r.discount_percentage AS "discountPercentage",
             r.is_active AS "isActive", r.created_at AS "createdAt", r.updated_at AS "updatedAt"
      FROM vip_rooms r
      LEFT JOIN branches b ON r.branch_id = b.id
      WHERE r.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ...row,
      hourlyRate: parseFloat(row.hourlyRate),
      discountPercentage: parseFloat(row.discountPercentage),
    };
  }

  async findByBranchAndName(branchId: number, name: string): Promise<VipRoomResponseDto | null> {
    const query = `
      SELECT id, branch_id AS "branchId", name
      FROM vip_rooms
      WHERE branch_id = $1 AND LOWER(name) = LOWER($2)
    `;
    const result = await pool.query(query, [branchId, name]);
    return result.rows[0] || null;
  }

  async create(dto: CreateVipRoomDto): Promise<VipRoomResponseDto> {
    const query = `
      INSERT INTO vip_rooms (branch_id, name, category, hourly_rate, discount_percentage, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, branch_id AS "branchId", name, category, hourly_rate AS "hourlyRate",
                discount_percentage AS "discountPercentage", is_active AS "isActive",
                created_at AS "createdAt", updated_at AS "updatedAt"
    `;
    const values = [
      dto.branchId,
      dto.name,
      dto.category ?? 'Medium',
      dto.hourlyRate,
      dto.discountPercentage ?? 0,
      dto.isActive ?? true,
    ];
    const result = await pool.query(query, values);
    const created = result.rows[0];
    const full = await this.findById(created.id);
    return full || created;
  }

  async update(id: number, dto: UpdateVipRoomDto): Promise<VipRoomResponseDto | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.branchId !== undefined) {
      fields.push(`branch_id = $${idx++}`);
      values.push(dto.branchId);
    }
    if (dto.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(dto.name);
    }
    if (dto.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(dto.category);
    }
    if (dto.hourlyRate !== undefined) {
      fields.push(`hourly_rate = $${idx++}`);
      values.push(dto.hourlyRate);
    }
    if (dto.discountPercentage !== undefined) {
      fields.push(`discount_percentage = $${idx++}`);
      values.push(dto.discountPercentage);
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
      UPDATE vip_rooms
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING id
    `;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) return null;
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM vip_rooms WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }
}
