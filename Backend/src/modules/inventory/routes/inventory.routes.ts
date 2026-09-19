import { Router } from 'express';
import { InventoryController } from '../controller/inventory.controller.js';
import { authenticate, authorize, branchAccess } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new InventoryController();

// Protect all inventory routes
router.use(authenticate);
router.use(branchAccess);

router.get('/stock', controller.getStockLevels);
router.get('/stock-levels', controller.getStockLevels);
router.get('/ledger', controller.getLedger);
router.get('/alerts', controller.getAlerts);

router.post('/stock-in', authorize(['ADMINISTRATOR', 'MANAGER', 'WAREHOUSE']), controller.stockIn);
router.post('/stock-out', authorize(['ADMINISTRATOR', 'MANAGER', 'WAREHOUSE']), controller.stockOut);
router.post('/transfer', authorize(['ADMINISTRATOR', 'MANAGER', 'WAREHOUSE']), controller.stockTransfer);
router.post('/adjustment', authorize(['ADMINISTRATOR', 'MANAGER']), controller.createAdjustment);
router.post('/adjust', authorize(['ADMINISTRATOR', 'MANAGER']), controller.adjustStock);

router.put('/toggle/:id', authorize(['ADMINISTRATOR', 'MANAGER']), controller.toggleProductStatus);
router.delete('/:id', authorize(['ADMINISTRATOR', 'MANAGER']), controller.deleteInventoryItem);

export default router;
