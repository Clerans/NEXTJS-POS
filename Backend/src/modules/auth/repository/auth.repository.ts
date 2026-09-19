import { pool } from '../../../config/db.js';

export interface UserRecord {
  id: number;
  username: string;
  password: string;
  name: string;
  role: string;
  email?: string;
  must_change_password?: boolean;
  pin_code_hash?: string;
  created_at: Date;
}

export interface RefreshTokenRecord {
  id: number;
  user_id: number;
  token_hash: string;
  is_revoked: boolean;
  expires_at: Date;
  created_at: Date;
  replaced_by_token_hash?: string;
}

export interface PasswordResetTokenRecord {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export class AuthRepository {
  async findUserByUsername(username: string): Promise<UserRecord | null> {
    const result = await pool.query(
      'SELECT id, username, password, name, role, email, must_change_password, pin_code_hash, created_at FROM users WHERE username = $1 LIMIT 1',
      [username]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as UserRecord;
  }

  async findUserById(id: number): Promise<UserRecord | null> {
    const result = await pool.query(
      'SELECT id, username, password, name, role, email, must_change_password, pin_code_hash, created_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as UserRecord;
  }

  async findUserByEmailOrUsername(emailOrUsername: string): Promise<UserRecord | null> {
    const result = await pool.query(
      `SELECT id, username, password, name, role, email, must_change_password, pin_code_hash, created_at
       FROM users
       WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
       LIMIT 1`,
      [emailOrUsername]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as UserRecord;
  }

  async createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, token, expiresAt]
    );
  }

  async findPasswordResetToken(token: string): Promise<PasswordResetTokenRecord | null> {
    const result = await pool.query(
      `SELECT id, user_id, token, expires_at, used, created_at
       FROM password_reset_tokens
       WHERE token = $1 LIMIT 1`,
      [token]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as PasswordResetTokenRecord;
  }

  async markPasswordResetTokenUsed(id: number): Promise<void> {
    await pool.query(`UPDATE password_reset_tokens SET used = true WHERE id = $1`, [id]);
  }

  async updatePassword(userId: number, hashedPassword: string): Promise<boolean> {
    const result = await pool.query(
      'UPDATE users SET password = $1, must_change_password = false WHERE id = $2',
      [hashedPassword, userId]
    );
    return (result.rowCount ?? 0) > 0;
  }

  async getUserPermissions(roleCode: string): Promise<string[]> {
    const result = await pool.query(
      `SELECT p.code 
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.code = $1`,
      [roleCode]
    );

    return result.rows.map((row) => row.code);
  }

  async getUserBranches(userId: number): Promise<Array<{ id: number; code: string; name: string }>> {
    const result = await pool.query(
      `SELECT w.id, w.code, w.name
       FROM warehouses w
       JOIN user_branches ub ON w.id = ub.branch_id
       WHERE ub.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      // Default fallback to main branch if no specific mapping assigned
      return [{ id: 1, code: 'MAIN', name: 'NEXUS Main Outlet' }];
    }

    return result.rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
    }));
  }

  async storeRefreshToken(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [userId, tokenHash, expiresAt]
    );
  }

  async findRefreshToken(tokenHash: string): Promise<RefreshTokenRecord | null> {
    const result = await pool.query(
      'SELECT * FROM refresh_tokens WHERE token_hash = $1 LIMIT 1',
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as RefreshTokenRecord;
  }

  async revokeRefreshToken(tokenHash: string, replacedByTokenHash?: string): Promise<void> {
    await pool.query(
      'UPDATE refresh_tokens SET is_revoked = true, replaced_by_token_hash = $1 WHERE token_hash = $2',
      [replacedByTokenHash || null, tokenHash]
    );
  }

  async revokeAllUserRefreshTokens(userId: number): Promise<void> {
    await pool.query(
      'UPDATE refresh_tokens SET is_revoked = true WHERE user_id = $1',
      [userId]
    );
  }

  async logAudit(
    userId: number | null,
    username: string | null,
    action: string,
    entityName: string,
    entityId?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO audit_logs (user_id, username, action, entity_name, entity_id, old_values, new_values, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          username,
          action,
          entityName,
          entityId || null,
          oldValues ? JSON.stringify(oldValues) : null,
          newValues ? JSON.stringify(newValues) : null,
          ipAddress || null,
        ]
      );
    } catch (err) {
      console.error('[AuditLog] Failed to record audit log:', err);
    }
  }
}
