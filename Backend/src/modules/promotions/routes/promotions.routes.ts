import { Router } from 'express';
import { PromotionController } from '../controller/promotions.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new PromotionController();

router.get('/', authenticate, controller.getPromotions);
router.post(
  '/',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.createPromotion
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.toggleStatus
);
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.deletePromotion
);
router.post(
  '/sms-campaigns',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.sendSmsCampaign
);

export default router;
