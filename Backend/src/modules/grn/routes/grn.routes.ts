import { Router } from 'express';
import { GRNController } from '../controller/grn.controller.js';
import { authenticate, authorize, branchAccess } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new GRNController();

// Authentication and Branch Access Enforcement
router.use(authenticate);
router.use(branchAccess);

/**
 * @route   GET /api/v1/grn
 * @desc    Get all Goods Received Notes (filtered by authorized branch)
 * @access  Protected (ADMINISTRATOR, MANAGER, WAREHOUSE)
 */
router.get('/', authorize(['ADMINISTRATOR', 'MANAGER', 'WAREHOUSE']), controller.getGRNs);

/**
 * @route   POST /api/v1/grn
 * @desc    Create Goods Received Note (GRN)
 * @access  Protected (ADMINISTRATOR, MANAGER, WAREHOUSE)
 */
router.post('/', authorize(['ADMINISTRATOR', 'MANAGER', 'WAREHOUSE']), controller.createGRN);

/**
 * @route   GET /api/v1/grn/:id
 * @desc    Get GRN details by ID (verified for authorized branch)
 * @access  Protected (ADMINISTRATOR, MANAGER, WAREHOUSE)
 */
router.get('/:id', authorize(['ADMINISTRATOR', 'MANAGER', 'WAREHOUSE']), controller.getGRNById);

/**
 * @route   POST /api/v1/grn/:id/payment
 * @desc    Record payment against GRN invoice
 * @access  Protected (ADMINISTRATOR, MANAGER)
 */
router.post('/:id/payment', authorize(['ADMINISTRATOR', 'MANAGER']), controller.recordPayment);

export default router;

