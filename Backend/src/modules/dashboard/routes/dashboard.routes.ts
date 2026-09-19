import { Router } from 'express';
import { DashboardController } from '../controller/dashboard.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new DashboardController();

// Apply auth middleware
router.use(authenticate);
router.use(authorize(['ADMINISTRATOR', 'MANAGER', 'CASHIER']));

/**
 * @route   GET /api/v1/dashboard/metrics
 * @desc    Get top dashboard KPIs (Total Sales, Active Customers, Growth %, Total Orders)
 * @access  Protected
 */
router.get('/metrics', controller.getMetrics);

/**
 * @route   GET /api/v1/dashboard/sales-trend
 * @desc    Get periodic sales trend chart data
 * @access  Protected
 */
router.get('/sales-trend', controller.getSalesTrend);

/**
 * @route   GET /api/v1/dashboard/orders-by-type
 * @desc    Get order counts and breakdown percentages by order type
 * @access  Protected
 */
router.get('/orders-by-type', controller.getOrdersByType);

/**
 * @route   GET /api/v1/dashboard/recent-sales
 * @desc    Get top N recent sales transactions
 * @access  Protected
 */
router.get('/recent-sales', controller.getRecentSales);

/**
 * @route   GET /api/v1/dashboard/low-stock-alerts
 * @desc    Get real-time low stock / out-of-stock items
 * @access  Protected
 */
router.get('/low-stock-alerts', controller.getLowStockAlerts);

export default router;
