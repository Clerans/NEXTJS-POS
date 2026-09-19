import { pool } from '../../../config/db.js';
import { CreateSupplierDto, UpdateSupplierDto, SupplierResponseDto } from '../dto/suppliers.dto.js';

export class SupplierRepository {
  async findAll(): Promise<SupplierResponseDto[]> {
    const result = await pool.query(
      `SELECT id, code, name, contact_person, phone, email, payment_terms, created_at 
       FROM suppliers ORDER BY id DESC`
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      contactPerson: row.contact_person || null,
      phone: row.phone,
      email: row.email || null,
      paymentTerms: row.payment_terms || 'NET 30',
      createdAt: row.created_at,
    }));
  }

  async findById(id: number): Promise<SupplierResponseDto | null> {
    const result = await pool.query(
      `SELECT id, code, name, contact_person, phone, email, payment_terms, created_at 
       FROM suppliers WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      contactPerson: row.contact_person || null,
      phone: row.phone,
      email: row.email || null,
      paymentTerms: row.payment_terms || 'NET 30',
      createdAt: row.created_at,
    };
  }

  async findByCode(code: string): Promise<SupplierResponseDto | null> {
    const result = await pool.query(
      `SELECT id, code, name, contact_person, phone, email, payment_terms, created_at 
       FROM suppliers WHERE LOWER(code) = LOWER($1)`,
      [code]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      code: row.code,
      name: row.name,
      contactPerson: row.contact_person || null,
      phone: row.phone,
      email: row.email || null,
      paymentTerms: row.payment_terms || 'NET 30',
      createdAt: row.created_at,
    };
  }

  async create(dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    const result = await pool.query(
      `INSERT INTO suppliers (code, name, contact_person, phone, email, payment_terms)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [
        dto.code,
        dto.name,
        dto.contactPerson || null,
        dto.phone,
        dto.email || null,
        dto.paymentTerms || 'NET 30',
      ]
    );

    return {
      id: parseInt(result.rows[0].id, 10),
      code: dto.code,
      name: dto.name,
      contactPerson: dto.contactPerson || null,
      phone: dto.phone,
      email: dto.email || null,
      paymentTerms: dto.paymentTerms || 'NET 30',
      createdAt: result.rows[0].created_at,
    };
  }
}
