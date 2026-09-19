import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').trim(),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

export const changePasswordSchema = z.object({
  userId: z.number().optional(),
  currentPassword: z.string().min(4, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const verifyPinSchema = z.object({
  pinCode: z.string().regex(/^\d{4,8}$/, 'PIN must be a 4-8 digit numeric string'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required').trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
export type VerifyPinSchema = z.infer<typeof verifyPinSchema>;
export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
