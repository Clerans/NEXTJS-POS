import { pool } from '../../../config/db.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/users.dto.js';

export class UserRepository {
  async findAll(): Promise<UserResponseDto[]> {
    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.role, u.email, u.created_at,
              COALESCE(
                json_agg(
                  json_build_object('id', b.id, 'name', b.name)
                ) FILTER (WHERE b.id IS NOT NULL),
                '[]'
              ) as branches
       FROM users u
       LEFT JOIN user_branches ub ON u.id = ub.user_id
       LEFT JOIN branches b ON ub.branch_id = b.id
       GROUP BY u.id, u.username, u.name, u.role, u.email, u.created_at
       ORDER BY u.id ASC`
    );

    const rolesRes = await pool.query('SELECT id, code, name FROM roles');
    const roleMap = new Map<string, { id: number; name: string }>();
    rolesRes.rows.forEach((r: any) => {
      roleMap.set(r.code, { id: r.id, name: r.name });
    });

    return result.rows.map((row: any) => {
      const roleInfo = roleMap.get(row.role) || { id: 1, name: row.role };
      const branches = Array.isArray(row.branches) && row.branches.length > 0
        ? row.branches
        : [{ id: 1, name: 'NEXUS Main Outlet' }];

      return {
        id: row.id,
        username: row.username,
        name: row.name,
        email: row.email || null,
        phone: null,
        role: {
          id: roleInfo.id,
          name: row.role,
        },
        branches,
        isActive: true,
        createdAt: row.created_at,
      };
    });
  }

  async findById(id: number): Promise<UserResponseDto | null> {
    const result = await pool.query(
      `SELECT u.id, u.username, u.name, u.role, u.email, u.created_at,
              COALESCE(
                json_agg(
                  json_build_object('id', b.id, 'name', b.name)
                ) FILTER (WHERE b.id IS NOT NULL),
                '[]'
              ) as branches
       FROM users u
       LEFT JOIN user_branches ub ON u.id = ub.user_id
       LEFT JOIN branches b ON ub.branch_id = b.id
       WHERE u.id = $1
       GROUP BY u.id, u.username, u.name, u.role, u.email, u.created_at
       LIMIT 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const roleRes = await pool.query('SELECT id, code, name FROM roles WHERE code = $1 LIMIT 1', [row.role]);
    const roleInfo = roleRes.rows.length > 0 ? { id: roleRes.rows[0].id, name: roleRes.rows[0].name } : { id: 1, name: row.role };
    const branches = Array.isArray(row.branches) && row.branches.length > 0
      ? row.branches
      : [{ id: 1, name: 'NEXUS Main Outlet' }];

    return {
      id: row.id,
      username: row.username,
      name: row.name,
      email: row.email || null,
      phone: row.phone || null,
      role: {
        id: roleInfo.id,
        name: row.role,
      },
      branches,
      isActive: true,
      createdAt: row.created_at,
    };
  }

  async create(dto: CreateUserDto, hashedPassword: string, hashedPin?: string): Promise<UserResponseDto> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Resolve role code and ID
      let roleCode = 'CASHIER';
      let roleId = dto.roleId || 3;

      if (dto.roleId) {
        const roleRes = await client.query('SELECT id, code, name FROM roles WHERE id = $1', [dto.roleId]);
        if (roleRes.rows.length > 0) {
          roleCode = roleRes.rows[0].code;
          roleId = roleRes.rows[0].id;
        }
      }

      const result = await client.query(
        `INSERT INTO users (username, password, name, role, email, pin_code_hash) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, username, name, role, email, created_at`,
        [dto.username, hashedPassword, dto.name, roleCode, dto.email || null, hashedPin || null]
      );

      const row = result.rows[0];
      const newUserId = row.id;

      // Assign role in user_roles
      if (roleId) {
        await client.query(
          `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newUserId, roleId]
        );
      }

      // Assign branches in user_branches
      const branchIds = dto.branchIds && dto.branchIds.length > 0 ? dto.branchIds : [1];
      const assignedBranches: Array<{ id: number; name: string }> = [];

      for (const bId of branchIds) {
        await client.query(
          `INSERT INTO user_branches (user_id, branch_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [newUserId, bId]
        );
        const bRes = await client.query('SELECT id, name FROM branches WHERE id = $1', [bId]);
        if (bRes.rows.length > 0) {
          assignedBranches.push({ id: bRes.rows[0].id, name: bRes.rows[0].name });
        }
      }

      await client.query('COMMIT');

      return {
        id: newUserId,
        username: row.username,
        name: row.name,
        email: row.email || null,
        phone: null,
        role: {
          id: roleId,
          name: row.role,
        },
        branches: assignedBranches.length > 0 ? assignedBranches : [{ id: 1, name: 'NEXUS Main Outlet' }],
        isActive: true,
        createdAt: row.created_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: number, dto: UpdateUserDto, hashedPin?: string): Promise<UserResponseDto | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const existingRes = await client.query('SELECT id, username, name, role, email FROM users WHERE id = $1', [id]);
      if (existingRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      let roleCode: string | undefined = undefined;
      let roleId = dto.roleId;

      if (dto.roleId) {
        const roleRes = await client.query('SELECT id, code, name FROM roles WHERE id = $1', [dto.roleId]);
        if (roleRes.rows.length > 0) {
          roleCode = roleRes.rows[0].code;
          roleId = roleRes.rows[0].id;
        }
      }

      const updates: string[] = [];
      const params: any[] = [];

      if (dto.name !== undefined) {
        params.push(dto.name);
        updates.push(`name = $${params.length}`);
      }
      if (dto.email !== undefined) {
        params.push(dto.email);
        updates.push(`email = $${params.length}`);
      }
      if (roleCode) {
        params.push(roleCode);
        updates.push(`role = $${params.length}`);
      }
      if (hashedPin !== undefined) {
        params.push(hashedPin);
        updates.push(`pin_code_hash = $${params.length}`);
      }

      if (updates.length > 0) {
        params.push(id);
        await client.query(
          `UPDATE users SET ${updates.join(', ')} WHERE id = $${params.length}`,
          params
        );
      }

      if (roleId) {
        await client.query('DELETE FROM user_roles WHERE user_id = $1', [id]);
        await client.query(
          `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, roleId]
        );
      }

      if (dto.branchIds && Array.isArray(dto.branchIds)) {
        await client.query('DELETE FROM user_branches WHERE user_id = $1', [id]);
        for (const bId of dto.branchIds) {
          await client.query(
            `INSERT INTO user_branches (user_id, branch_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [id, bId]
          );
        }
      }

      await client.query('COMMIT');

      return await this.findById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
