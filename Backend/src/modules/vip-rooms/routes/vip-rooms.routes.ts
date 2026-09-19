import { Router } from 'express';
import { VipRoomController } from '../controller/vip-rooms.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new VipRoomController();

router.get('/', controller.getRooms);
router.get('/:id', controller.getRoomById);
router.post(
  '/',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.createRoom
);
router.put(
  '/:id',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.updateRoom
);
router.patch(
  '/:id/status',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.updateStatus
);
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMINISTRATOR']),
  controller.deleteRoom
);

export default router;
