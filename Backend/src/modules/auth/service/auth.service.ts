import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AuthRepository } from '../repository/auth.repository.js';
import {
  LoginRequestDto,
  ChangePasswordRequestDto,
  AuthTokenResponseDto,
  UserAuthProfileDto,
  ResetPasswordRequestDto,
} from '../dto/auth.dto.js';
import { UnauthorizedError, NotFoundError, BadRequestError, ForbiddenError, AppError } from '../../../common/errors/app-error.js';
import { JWT_SECRET } from '../../../common/middleware/auth.middleware.js';

import { config } from '../../../config/env.js';

const JWT_REFRESH_SECRET = config.jwtRefreshSecret;

export class AuthService {
  private authRepository: AuthRepository;

  constructor() {
    this.authRepository = new AuthRepository();
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async login(dto: LoginRequestDto, ipAddress?: string): Promise<AuthTokenResponseDto> {
    const user = await this.authRepository.findUserByUsername(dto.username);

    if (!user) {
      await this.authRepository.logAudit(null, dto.username, 'LOGIN_FAILURE', 'users', undefined, null, { reason: 'User not found' }, ipAddress);
      throw new UnauthorizedError('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      await this.authRepository.logAudit(user.id, user.username, 'LOGIN_FAILURE', 'users', String(user.id), null, { reason: 'Invalid password' }, ipAddress);
      throw new UnauthorizedError('Invalid username or password');
    }

    const permissions = await this.authRepository.getUserPermissions(user.role);
    const branches = await this.authRepository.getUserBranches(user.id);
    const branchIds = branches.map((b) => b.id);

    const mustChange = user.must_change_password ?? false;

    const userProfile: UserAuthProfileDto = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email || null,
      role: user.role,
      mustChangePassword: mustChange,
      branches,
    };

    const accessToken = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
        permissions,
        branchIds,
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, jti: crypto.randomUUID() },
      JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    const refreshTokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await this.authRepository.storeRefreshToken(user.id, refreshTokenHash, expiresAt);

    await this.authRepository.logAudit(user.id, user.username, 'LOGIN_SUCCESS', 'users', String(user.id), null, null, ipAddress);

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      user: userProfile,
    };
  }

  async changePassword(dto: ChangePasswordRequestDto, requestingUserId?: number, userRole?: string, ipAddress?: string): Promise<void> {
    const targetUserId = requestingUserId || dto.userId;
    if (!targetUserId) {
      throw new BadRequestError('User ID is required');
    }

    // Normal users can only change their own password
    if (dto.userId && dto.userId !== requestingUserId && userRole !== 'ADMINISTRATOR') {
      throw new ForbiddenError('Users can only change their own password');
    }

    const user = await this.authRepository.findUserById(targetUserId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.authRepository.updatePassword(targetUserId, hashedNewPassword);

    await this.authRepository.logAudit(user.id, user.username, 'PASSWORD_CHANGED', 'users', String(user.id), null, null, ipAddress);
  }

  async forgotPassword(
    emailOrUsername: string,
    ipAddress?: string
  ): Promise<{ success: boolean; message: string; resetToken?: string }> {
    const user = await this.authRepository.findUserByEmailOrUsername(emailOrUsername);
    if (!user) {
      return {
        success: true,
        message: 'If an account with that email or username exists, a password reset link has been sent.',
      };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour token validity

    await this.authRepository.createPasswordResetToken(user.id, resetToken, expiresAt);

    await this.authRepository.logAudit(
      user.id,
      user.username,
      'PASSWORD_RESET_REQUESTED',
      'users',
      String(user.id),
      null,
      null,
      ipAddress
    );

    return {
      success: true,
      message: 'If an account with that email or username exists, password reset instructions have been sent.',
      resetToken,
    };
  }

  async resetPassword(
    dto: ResetPasswordRequestDto,
    ipAddress?: string
  ): Promise<{ success: boolean; message: string }> {
    const tokenRecord = await this.authRepository.findPasswordResetToken(dto.token);
    if (!tokenRecord || tokenRecord.used || new Date() > new Date(tokenRecord.expires_at)) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const user = await this.authRepository.findUserById(tokenRecord.user_id);
    if (!user) {
      throw new NotFoundError('User associated with reset token not found');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.authRepository.updatePassword(user.id, hashedPassword);
    await this.authRepository.markPasswordResetTokenUsed(tokenRecord.id);

    await this.authRepository.logAudit(
      user.id,
      user.username,
      'PASSWORD_RESET_COMPLETED',
      'users',
      String(user.id),
      null,
      null,
      ipAddress
    );

    return {
      success: true,
      message: 'Password has been reset successfully. You may now log in with your new password.',
    };
  }

  async verifyPin(pinCode: string, userId: number): Promise<boolean> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (!user.pin_code_hash) {
      return false;
    }

    return await bcrypt.compare(pinCode, user.pin_code_hash);
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; token: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: number };
      const tokenHash = this.hashToken(refreshToken);

      const tokenRecord = await this.authRepository.findRefreshToken(tokenHash);
      if (!tokenRecord) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      if (tokenRecord.is_revoked) {
        // Reuse detection: revoke all active tokens for this user
        await this.authRepository.revokeAllUserRefreshTokens(decoded.userId);
        await this.authRepository.logAudit(decoded.userId, null, 'REFRESH_TOKEN_REUSE_DETECTED', 'refresh_tokens', String(tokenRecord.id));
        throw new UnauthorizedError('Compromised or revoked refresh token presented');
      }

      if (new Date() > new Date(tokenRecord.expires_at)) {
        throw new UnauthorizedError('Expired refresh token');
      }

      const user = await this.authRepository.findUserById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError('User associated with token no longer exists');
      }

      const permissions = await this.authRepository.getUserPermissions(user.role);
      const branches = await this.authRepository.getUserBranches(user.id);
      const branchIds = branches.map((b) => b.id);

      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role,
          permissions,
          branchIds,
        },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const newRefreshToken = jwt.sign(
        { userId: user.id, jti: crypto.randomUUID() },
        JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const newRefreshTokenHash = this.hashToken(newRefreshToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      // Rotate: Revoke old token and link to new replacement token
      await this.authRepository.revokeRefreshToken(tokenHash, newRefreshTokenHash);
      await this.authRepository.storeRefreshToken(user.id, newRefreshTokenHash, expiresAt);

      return {
        token: newAccessToken,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken?: string, userId?: number, username?: string, ipAddress?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.authRepository.revokeRefreshToken(tokenHash);
    }
    if (userId) {
      await this.authRepository.logAudit(userId, username || null, 'LOGOUT', 'users', String(userId), null, null, ipAddress);
    }
  }
}
