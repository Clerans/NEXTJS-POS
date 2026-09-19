import { Router } from 'express';
import { POSController } from '../controller/pos.controller.js';
import { authenticate, authorize, branchAccess } from '../../../common/middleware/auth.middleware.js';
import { posVoidRateLimiter } from '../../../common/middleware/rateLimiter.js';

const router = Router();
const controller = new POSController();

// Authentication and RBAC Protection
router.use(authenticate);
router.use(branchAccess);
router.use(authorize(['ADMINISTRATOR', 'MANAGER', 'CASHIER']));

/**
 * @route   GET /api/v1/pos/kds
 * @desc    Get active Barista KDS tickets (RECEIVED, PREPARING, READY)
 * @access  Protected
 */
router.get('/kds', controller.getKDSOrders);

/**
 * @route   PATCH /api/v1/pos/kds/:orderId/status
 * @desc    Advance KDS ticket status (RECEIVED -> PREPARING -> READY -> SERVED)
 * @access  Protected
 */
router.patch('/kds/:orderId/status', controller.updateKDSStatus);

/**
 * @route   GET /api/v1/pos/orders
 * @desc    Get paginated sales history orders with search query filter
 * @access  Protected
 */
router.get('/orders', controller.getAllOrders);

/**
 * @route   GET /api/v1/pos/orders/:id
 * @desc    Get single sales order details by ID
 * @access  Protected
 */
router.get('/orders/:id', controller.getOrderById);

/**
 * @route   GET /api/v1/pos/orders/:id/receipt
 * @desc    Get sales order receipt formatted details
 * @access  Protected
 */
router.get('/orders/:id/receipt', controller.getReceipt);

/**
 * @route   POST /api/v1/pos/orders
 * @desc    Process checkout and create a sales order
 * @access  Protected
 */
router.post('/orders', controller.processOrder);

/**
 * @route   POST /api/v1/pos/checkout
 * @desc    Alias for process checkout
 * @access  Protected
 */
router.post('/checkout', controller.processOrder);

/**
 * @route   POST /api/v1/pos/orders/void
 * @desc    Void an active sales order ticket with manager PIN
 * @access  Protected
 */
router.post('/orders/void', posVoidRateLimiter, controller.voidOrder);

/**
 * @route   POST /api/v1/pos/void
 * @desc    Alias for void ticket
 * @access  Protected
 */
router.post('/void', posVoidRateLimiter, controller.voidOrder);

export default router;
