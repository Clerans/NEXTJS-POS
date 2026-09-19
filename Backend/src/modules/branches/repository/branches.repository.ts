import { pool } from '../../../config/db.js';
import { CreateBranchDto, UpdateBranchDto, BranchResponseDto } from '../dto/branches.dto.js';

export class BranchRepository {
  async findAll(): Promise<BranchResponseDto[]> {
    const result = await pool.query(
      `SELECT id, code, name, address, phone, is_active, created_at 
       FROM branches ORDER BY id ASC`
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      address: row.address || null,
      phone: row.phone || null,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
    }));
  }

  async findById(id: number): Promise<BranchResponseDto | null> {
    const result = await pool.query(
      `SELECT id, code, name, address, phone, is_active, created_at 
       FROM branches WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      address: row.address || null,
      phone: row.phone || null,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
    };
  }

  async findByCode(code: string): Promise<BranchResponseDto | null> {
    const result = await pool.query(
      `SELECT id, code, name, address, phone, is_active, created_at 
       FROM branches WHERE LOWER(code) = LOWER($1)`,
      [code]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      address: row.address || null,
      phone: row.phone || null,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
    };
  }

  async create(dto: CreateBranchDto): Promise<BranchResponseDto> {
    const result = await pool.query(
      `INSERT INTO branches (code, name, address, phone, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, code, name, address, phone, is_active, created_at`,
      [
        dto.code,
        dto.name,
        dto.address || null,
        dto.phone || null,
        dto.isActive !== undefined ? dto.isActive : true,
      ]
    );

    const row = result.rows[0];
    return {
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      address: row.address || null,
      phone: row.phone || null,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
    };
  }

  async update(id: number, dto: UpdateBranchDto): Promise<BranchResponseDto | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const code = dto.code !== undefined ? dto.code : existing.code;
    const name = dto.name !== undefined ? dto.name : existing.name;
    const address = dto.address !== undefined ? dto.address : existing.address;
    const phone = dto.phone !== undefined ? dto.phone : existing.phone;
    const isActive = dto.isActive !== undefined ? dto.isActive : existing.isActive;

    const result = await pool.query(
      `UPDATE branches
       SET code = $1, name = $2, address = $3, phone = $4, is_active = $5
       WHERE id = $6
       RETURNING id, code, name, address, phone, is_active, created_at`,
      [code, name, address, phone, isActive, id]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      address: row.address || null,
      phone: row.phone || null,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM branches WHERE id = $1 RETURNING id`, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
