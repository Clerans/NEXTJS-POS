import { Router } from 'express';
import { ReportController } from '../controller/reports.controller.js';
import { authenticate, authorize, branchAccess } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new ReportController();

// Security: Require Authentication, Branch Access, and Management Roles
router.use(authenticate);
router.use(branchAccess);
router.use(authorize(['ADMINISTRATOR', 'MANAGER']));

/**
 * @route   GET /api/v1/reports/sales-summary
 * @desc    Get aggregate sales revenue, gross volume, and tax summary
 * @access  Protected (ADMINISTRATOR, MANAGER)
 */
router.get('/sales-summary', controller.getSalesSummary);

/**
 * @route   GET /api/v1/reports/cogs-margin
 * @desc    Get cost of goods sold (COGS) and margin breakdown per product
 * @access  Protected (ADMINISTRATOR, MANAGER)
 */
router.get('/cogs-margin', controller.getProductMargins);

/**
 * @route   GET /api/v1/reports/payment-summary
 * @desc    Get payment method totals (CASH, CARD, CREDIT)
 * @access  Protected (ADMINISTRATOR, MANAGER)
 */
router.get('/payment-summary', controller.getPaymentSummary);

/**
 * @route   GET /api/v1/reports/daily-sales
 * @desc    Get daily trend sales figures
 * @access  Protected (ADMINISTRATOR, MANAGER)
 */
router.get('/daily-sales', controller.getDailySales);

/**
 * @route   GET /api/v1/reports/inventory-ledger
 * @desc    Get stock movement ledger logs
 * @access  Protected (ADMINISTRATOR, MANAGER)
 */
router.get('/inventory-ledger', controller.getInventoryLedgerReport);

/**
 * @route   GET /api/v1/reports/supplier-summary
 * @desc    Get purchasing and supplier payment breakdown
 * @access  Protected (ADMINISTRATOR, MANAGER)
 */
router.get('/supplier-summary', controller.getSupplierSummary);

export default router;

