import { Router } from 'express';
import { BranchController } from '../controller/branches.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new BranchController();

router.get('/', controller.getBranches);
router.get('/:id', controller.getBranchById);
router.post('/', authenticate, authorize('ADMINISTRATOR'), controller.createBranch);
router.put('/:id', authenticate, authorize('ADMINISTRATOR'), controller.updateBranch);
router.delete('/:id', authenticate, authorize('ADMINISTRATOR'), controller.deleteBranch);

export default router;
