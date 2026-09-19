import { Router } from 'express';
import { SettingController } from '../controller/settings.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new SettingController();

router.get('/settings', authenticate, controller.getSettings);
router.put(
  '/settings',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.updateSettings
);
router.get(
  '/audit-logs',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.getAuditLogs
);

export default router;
