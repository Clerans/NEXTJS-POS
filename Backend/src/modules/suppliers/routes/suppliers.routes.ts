import { Router } from 'express';
import { SupplierController } from '../controller/suppliers.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new SupplierController();

router.use(authenticate);

router.get('/', controller.getSuppliers);
router.post('/', authorize(['ADMINISTRATOR', 'MANAGER']), controller.createSupplier);
router.get('/:id', controller.getSupplierById);

export default router;
