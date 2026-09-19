import { Router } from 'express';
import { UserController } from '../controller/users.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new UserController();

router.use(authenticate);

router.get('/', authorize(['ADMINISTRATOR', 'MANAGER']), controller.getUsers);
router.post('/', authorize(['ADMINISTRATOR']), controller.createUser);
router.get('/:id', authorize(['ADMINISTRATOR', 'MANAGER']), controller.getUserById);
router.put('/:id', authorize(['ADMINISTRATOR']), controller.updateUser);
router.delete('/:id', authorize(['ADMINISTRATOR']), controller.deleteUser);

export default router;
