import { Router } from 'express';
import { CustomerController } from '../controller/customers.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new CustomerController();

router.use(authenticate);

// Customer Groups sub-resource endpoints (must precede /:id)
router.get('/groups', controller.getGroups);
router.get('/groups/:id', controller.getGroupById);
router.post('/groups', authorize(['ADMINISTRATOR', 'MANAGER']), controller.createGroup);
router.put('/groups/:id', authorize(['ADMINISTRATOR', 'MANAGER']), controller.updateGroup);
router.delete('/groups/:id', authorize(['ADMINISTRATOR']), controller.deleteGroup);

// Main Customer endpoints
router.get('/', controller.getCustomers);
router.get('/:id', controller.getCustomerById);
router.post('/', authorize(['ADMINISTRATOR', 'MANAGER']), controller.createCustomer);

export default router;
