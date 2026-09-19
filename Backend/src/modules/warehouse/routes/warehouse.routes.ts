import { Router } from 'express';
import { WarehouseController } from '../controller/warehouse.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new WarehouseController();

// Stock Transfers Endpoints
router.get('/transfers', controller.getTransfers);
router.post('/transfers', controller.createTransfer);
router.post('/transfer', controller.createTransfer);

router.post('/transfers/:id/complete', authenticate, authorize(['ADMINISTRATOR', 'MANAGER']), controller.completeTransfer);
router.post('/transfer/:id/complete', authenticate, authorize(['ADMINISTRATOR', 'MANAGER']), controller.completeTransfer);

router.post('/transfers/:id/cancel', authenticate, authorize(['ADMINISTRATOR', 'MANAGER']), controller.cancelTransfer);
router.post('/transfer/:id/cancel', authenticate, authorize(['ADMINISTRATOR', 'MANAGER']), controller.cancelTransfer);

router.get('/transfers/:id', controller.getTransferById);
router.get('/transfer/:id', controller.getTransferById);
router.put('/transfers/:id/status', controller.updateStatus);

// Warehouse Production Endpoints
router.get('/productions', controller.getProductions);
router.get('/productions/:id', controller.getProductionById);
router.post('/productions', authenticate, authorize(['ADMINISTRATOR', 'MANAGER']), controller.createProduction);

export default router;
