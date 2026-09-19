import { Router } from 'express';
import { DiningTableController } from '../controller/tables.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new DiningTableController();

router.get('/', controller.getTables);
router.get('/:id', controller.getTableById);
router.post(
  '/',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.createTable
);
router.put(
  '/:id',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.updateTable
);
router.patch(
  '/:id/availability',
  authenticate,
  controller.updateAvailability
);
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMINISTRATOR']),
  controller.deleteTable
);

export default router;
