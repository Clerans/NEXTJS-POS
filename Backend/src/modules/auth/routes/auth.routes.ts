import { Router } from 'express';
import { AuthController } from '../controller/auth.controller.js';
import { authRateLimiter } from '../../../common/middleware/rateLimiter.js';
import { authenticate } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new AuthController();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user & return JWT tokens
 * @access  Public
 */
router.post('/login', authRateLimiter, controller.login);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Protected
 */
router.post('/change-password', authRateLimiter, authenticate, controller.changePassword);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Request password reset token
 * @access  Public
 */
router.post('/forgot-password', authRateLimiter, controller.forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset user password using token
 * @access  Public
 */
router.post('/reset-password', authRateLimiter, controller.resetPassword);

/**
 * @route   POST /api/v1/auth/verify-pin
 * @desc    Verify manager PIN elevation code
 * @access  Protected
 */
router.post('/verify-pin', authRateLimiter, authenticate, controller.verifyPin);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', authRateLimiter, controller.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user & invalidate tokens
 * @access  Protected / Public fallback
 */
router.post('/logout', authRateLimiter, controller.logout);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user auth profile
 * @access  Protected
 */
router.get('/me', authenticate, controller.me);

export default router;
