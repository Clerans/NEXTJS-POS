import { Router } from 'express';
import { POController } from '../controller/po.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new POController();

router.use(authenticate);

router.get('/', controller.getPOs);
router.post('/', authorize(['ADMINISTRATOR', 'MANAGER']), controller.createPO);
router.get('/:id', controller.getPOById);
router.put('/:id/approve', authorize(['ADMINISTRATOR', 'MANAGER']), controller.approvePO);

// Status transition endpoint supporting /:id/status and /orders/:id/status
router.patch('/:id/status', authorize(['ADMINISTRATOR', 'MANAGER']), controller.updateStatus);
router.patch('/orders/:id/status', authorize(['ADMINISTRATOR', 'MANAGER']), controller.updateStatus);

export default router;
