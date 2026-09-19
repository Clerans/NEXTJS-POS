import { Router } from 'express';
import { RawMaterialController } from '../controller/raw-materials.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new RawMaterialController();

// Batches & Inventory endpoints (must precede /:id route parameter)
router.get('/batches', controller.getBatches);
router.post(
  '/batches',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.createBatch
);

router.get('/inventory', controller.getInventory);
router.post(
  '/inventory/adjust',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.adjustStock
);

// Standard Raw Material CRUD endpoints
router.get('/', controller.getRawMaterials);
router.get('/:id', controller.getRawMaterialById);
router.post(
  '/',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.createRawMaterial
);
router.put(
  '/:id',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.updateRawMaterial
);
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.deleteRawMaterial
);

export default router;
