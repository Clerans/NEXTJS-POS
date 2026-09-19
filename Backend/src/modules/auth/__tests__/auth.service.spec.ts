import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import { AuthService } from '../service/auth.service.js';
import { pool, initDatabase } from '../../../config/db.js';
import { UnauthorizedError, ForbiddenError, BadRequestError } from '../../../common/errors/app-error.js';

describe('AuthService & Security Core', () => {
  let authService: AuthService;

  beforeEach(async () => {
    await initDatabase();
    authService = new AuthService();

    // Ensure default admin user with hashed password and hashed PIN exists in DB
    const hashedPass = await bcrypt.hash('password', 10);
    const hashedPin = await bcrypt.hash('1234', 10);

    await pool.query(
      `INSERT INTO users (id, username, password, name, role, must_change_password, pin_code_hash, email)
       VALUES (1, 'admin', $1, 'NEXUS Administrator', 'ADMINISTRATOR', true, $2, 'admin@nexuspos.com')
       ON CONFLICT (username) DO UPDATE SET password = $1, pin_code_hash = $2, email = 'admin@nexuspos.com'`,
      [hashedPass, hashedPin]
    );
  });

  it('should authenticate valid DB credentials and return JWT tokens', async () => {
    const result = await authService.login({
      username: 'admin',
      password: 'password',
    });

    assert.ok(result);
    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
    assert.strictEqual(result.user.username, 'admin');
    assert.strictEqual(result.user.role, 'ADMINISTRATOR');
  });

  it('should reject invalid credentials with UnauthorizedError', async () => {
    await assert.rejects(
      async () => {
        await authService.login({ username: 'admin', password: 'wrongpassword' });
      },
      (err: any) => err instanceof UnauthorizedError
    );
  });

  it('should reject unregistered username with UnauthorizedError', async () => {
    await assert.rejects(
      async () => {
        await authService.login({ username: 'nonexistent_user', password: 'password' });
      },
      (err: any) => err instanceof UnauthorizedError
    );
  });

  it('should verify valid hashed manager PIN code', async () => {
    const isVerified = await authService.verifyPin('1234', 1);
    assert.strictEqual(isVerified, true);
  });

  it('should reject invalid manager PIN code', async () => {
    const isVerified = await authService.verifyPin('9999', 1);
    assert.strictEqual(isVerified, false);
  });

  it('should support refresh token rotation', async () => {
    const loginRes = await authService.login({ username: 'admin', password: 'password' });
    const refreshRes = await authService.refreshTokens(loginRes.refreshToken);

    assert.ok(refreshRes.accessToken);
    assert.ok(refreshRes.refreshToken);
    assert.notStrictEqual(refreshRes.refreshToken, loginRes.refreshToken);
  });

  it('should revoke refresh token on logout', async () => {
    const loginRes = await authService.login({ username: 'admin', password: 'password' });
    await authService.logout(loginRes.refreshToken);

    await assert.rejects(
      async () => {
        await authService.refreshTokens(loginRes.refreshToken);
      },
      (err: any) => err instanceof UnauthorizedError
    );
  });

  it('should reject non-admin user changing another user password with ForbiddenError', async () => {
    await assert.rejects(
      async () => {
        await authService.changePassword(
          { userId: 2, currentPassword: 'password', newPassword: 'newpassword123' },
          10, // requesting user ID 10
          'CASHIER' // requesting user role CASHIER
        );
      },
      (err: any) => err instanceof ForbiddenError
    );
  });

  it('should issue password reset token for valid username/email', async () => {
    const res = await authService.forgotPassword('admin');
    assert.strictEqual(res.success, true);
    assert.ok(res.resetToken);
  });

  it('should reset password using valid reset token', async () => {
    const forgotRes = await authService.forgotPassword('admin');
    assert.ok(forgotRes.resetToken);

    const resetRes = await authService.resetPassword({
      token: forgotRes.resetToken!,
      newPassword: 'newAdminPassword123',
    });

    assert.strictEqual(resetRes.success, true);

    // Verify login with new password
    const loginRes = await authService.login({ username: 'admin', password: 'newAdminPassword123' });
    assert.ok(loginRes.accessToken);
  });

  it('should reject reuse of password reset token', async () => {
    const forgotRes = await authService.forgotPassword('admin');
    assert.ok(forgotRes.resetToken);

    await authService.resetPassword({
      token: forgotRes.resetToken!,
      newPassword: 'newAdminPassword123',
    });

    await assert.rejects(
      async () => {
        await authService.resetPassword({
          token: forgotRes.resetToken!,
          newPassword: 'anotherNewPassword456',
        });
      },
      (err: any) => err instanceof BadRequestError
    );
  });
});
