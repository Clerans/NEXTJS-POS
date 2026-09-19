import { Router } from 'express';
import { login, changePassword } from '../controllers/authController.js';
import { authRateLimiter } from '../common/middleware/rateLimiter.js';

const router = Router();

router.post('/login', authRateLimiter, login);
router.post('/change-password', changePassword);

export default router;
