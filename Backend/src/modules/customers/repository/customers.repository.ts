import { pool } from '../../../config/db.js';
import {
  CreateCustomerDto,
  CustomerResponseDto,
  CreateCustomerGroupDto,
  UpdateCustomerGroupDto,
  CustomerGroupResponseDto,
} from '../dto/customers.dto.js';

export class CustomerRepository {
  async findAll(): Promise<CustomerResponseDto[]> {
    const result = await pool.query(
      `SELECT c.id, c.customer_code, c.name, c.mobile, c.email, c.group_id, c.loyalty_points,
              c.outstanding_balance, c.credit_limit, c.created_at,
              g.name as group_name
       FROM customers c
       LEFT JOIN customer_groups g ON c.group_id = g.id
       ORDER BY c.id DESC`
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      customerCode: row.customer_code,
      name: row.name,
      mobile: row.mobile,
      email: row.email || null,
      groupId: parseInt(row.group_id || '1', 10),
      groupName: row.group_name || 'Regular Dining',
      loyaltyPoints: parseInt(row.loyalty_points || '0', 10),
      outstandingBalance: parseFloat(row.outstanding_balance || 0),
      creditLimit: parseFloat(row.credit_limit || 0),
      createdAt: row.created_at,
    }));
  }

  async findById(id: number): Promise<CustomerResponseDto | null> {
    const result = await pool.query(
      `SELECT c.id, c.customer_code, c.name, c.mobile, c.email, c.group_id, c.loyalty_points,
              c.outstanding_balance, c.credit_limit, c.created_at,
              g.name as group_name
       FROM customers c
       LEFT JOIN customer_groups g ON c.group_id = g.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      customerCode: row.customer_code,
      name: row.name,
      mobile: row.mobile,
      email: row.email || null,
      groupId: parseInt(row.group_id || '1', 10),
      groupName: row.group_name || 'Regular Dining',
      loyaltyPoints: parseInt(row.loyalty_points || '0', 10),
      outstandingBalance: parseFloat(row.outstanding_balance || 0),
      creditLimit: parseFloat(row.credit_limit || 0),
      createdAt: row.created_at,
    };
  }

  async findByMobile(mobile: string): Promise<CustomerResponseDto | null> {
    const result = await pool.query(
      `SELECT c.id, c.customer_code, c.name, c.mobile, c.email, c.group_id, c.loyalty_points,
              c.outstanding_balance, c.credit_limit, c.created_at,
              g.name as group_name
       FROM customers c
       LEFT JOIN customer_groups g ON c.group_id = g.id
       WHERE c.mobile = $1`,
      [mobile]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      customerCode: row.customer_code,
      name: row.name,
      mobile: row.mobile,
      email: row.email || null,
      groupId: parseInt(row.group_id || '1', 10),
      groupName: row.group_name || 'Regular Dining',
      loyaltyPoints: parseInt(row.loyalty_points || '0', 10),
      outstandingBalance: parseFloat(row.outstanding_balance || 0),
      creditLimit: parseFloat(row.credit_limit || 0),
      createdAt: row.created_at,
    };
  }

  async create(dto: CreateCustomerDto, customerCode: string): Promise<CustomerResponseDto> {
    const result = await pool.query(
      `INSERT INTO customers (customer_code, name, mobile, email, group_id, credit_limit)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at`,
      [
        customerCode,
        dto.name,
        dto.mobile,
        dto.email || null,
        dto.groupId || 1,
        dto.creditLimit || 0.00,
      ]
    );

    const groupRes = await pool.query('SELECT name FROM customer_groups WHERE id = $1', [dto.groupId || 1]);

    return {
      id: parseInt(result.rows[0].id, 10),
      customerCode,
      name: dto.name,
      mobile: dto.mobile,
      email: dto.email || null,
      groupId: dto.groupId || 1,
      groupName: groupRes.rows[0]?.name || 'Regular Dining',
      loyaltyPoints: 0,
      outstandingBalance: 0.00,
      creditLimit: dto.creditLimit || 0.00,
      createdAt: result.rows[0].created_at,
    };
  }

  // --- CUSTOMER GROUPS METHODS ---

  async findAllGroups(): Promise<CustomerGroupResponseDto[]> {
    const result = await pool.query(
      `SELECT id, name, discount_rate FROM customer_groups ORDER BY id ASC`
    );

    return result.rows.map((row: any) => ({
      id: parseInt(row.id, 10),
      name: row.name,
      discountRate: parseFloat(row.discount_rate || '0'),
    }));
  }

  async findGroupById(id: number): Promise<CustomerGroupResponseDto | null> {
    const result = await pool.query(
      `SELECT id, name, discount_rate FROM customer_groups WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      name: row.name,
      discountRate: parseFloat(row.discount_rate || '0'),
    };
  }

  async findGroupByName(name: string): Promise<CustomerGroupResponseDto | null> {
    const result = await pool.query(
      `SELECT id, name, discount_rate FROM customer_groups WHERE LOWER(name) = LOWER($1)`,
      [name]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      name: row.name,
      discountRate: parseFloat(row.discount_rate || '0'),
    };
  }

  async createGroup(dto: CreateCustomerGroupDto): Promise<CustomerGroupResponseDto> {
    const result = await pool.query(
      `INSERT INTO customer_groups (name, discount_rate)
       VALUES ($1, $2)
       RETURNING id, name, discount_rate`,
      [dto.name, dto.discountRate !== undefined ? dto.discountRate : 0.0]
    );

    const row = result.rows[0];
    return {
      id: parseInt(row.id, 10),
      name: row.name,
      discountRate: parseFloat(row.discount_rate || '0'),
    };
  }

  async updateGroup(id: number, dto: UpdateCustomerGroupDto): Promise<CustomerGroupResponseDto | null> {
    const existing = await this.findGroupById(id);
    if (!existing) return null;

    const name = dto.name !== undefined ? dto.name : existing.name;
    const discountRate = dto.discountRate !== undefined ? dto.discountRate : existing.discountRate;

    const result = await pool.query(
      `UPDATE customer_groups
       SET name = $1, discount_rate = $2
       WHERE id = $3
       RETURNING id, name, discount_rate`,
      [name, discountRate, id]
    );

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
      id: parseInt(row.id, 10),
      name: row.name,
      discountRate: parseFloat(row.discount_rate || '0'),
    };
  }

  async deleteGroup(id: number): Promise<boolean> {
    const result = await pool.query(`DELETE FROM customer_groups WHERE id = $1 RETURNING id`, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
