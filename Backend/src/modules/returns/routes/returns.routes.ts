import { Router } from 'express';
import { ReturnController } from '../controller/returns.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new ReturnController();

router.use(authenticate);

router.get('/', controller.getReturns);
router.post('/customer', authorize(['ADMINISTRATOR', 'MANAGER', 'CASHIER']), controller.createCustomerReturn);
router.post('/supplier', authorize(['ADMINISTRATOR', 'MANAGER']), controller.createSupplierReturn);

export default router;
