import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../service/auth.service.js';
import {
  loginSchema,
  changePasswordSchema,
  verifyPinSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validator/auth.validator.js';
import { AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await this.authService.login(validatedData, req.ip);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        token: result.token,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        user: result.user,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      const requestingUserId = (req as AuthenticatedRequest).user?.userId;
      const userRole = (req as AuthenticatedRequest).user?.role;
      await this.authService.changePassword(validatedData, requestingUserId, userRole, req.ip);

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      const result = await this.authService.forgotPassword(validatedData.emailOrUsername, req.ip);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      const result = await this.authService.resetPassword(validatedData, req.ip);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  verifyPin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = verifyPinSchema.parse(req.body);
      const userId = (req as AuthenticatedRequest).user?.userId || 1;
      const isVerified = await this.authService.verifyPin(validatedData.pinCode, userId);

      res.status(200).json({
        success: true,
        message: isVerified ? 'Manager PIN verified' : 'Invalid manager PIN',
        data: { verified: isVerified },
      });
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const result = await this.authService.refreshTokens(validatedData.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const refreshToken = req.body?.refreshToken;
      await this.authService.logout(refreshToken, authReq.user?.userId, authReq.user?.username, req.ip);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      res.status(200).json({
        success: true,
        data: authReq.user,
      });
    } catch (error) {
      next(error);
    }
  };
}
