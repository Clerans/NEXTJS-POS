import { Router } from 'express';
import { HRController } from '../controller/hr.controller.js';
import { authenticate, authorize, requirePermission } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new HRController();

router.get('/employees', authenticate, requirePermission('HR_EMPLOYEE_VIEW'), controller.getEmployees);
router.post('/employees', authenticate, requirePermission('HR_EMPLOYEE_CREATE'), controller.createEmployee);
router.put('/employees/:id', authenticate, requirePermission('HR_EMPLOYEE_UPDATE'), controller.updateEmployee);

router.post('/attendance/clock-in', authenticate, controller.clockIn);
router.post('/attendance/clock-out', authenticate, controller.clockOut);

router.post('/shifts', authenticate, authorize(['ADMINISTRATOR', 'MANAGER', 'HR']), controller.createShift);

router.post('/leave/request', authenticate, controller.createLeaveRequest);
router.post('/leave/approve', authenticate, requirePermission('HR_LEAVE_APPROVE'), controller.approveLeave);

router.post('/payroll/calculate', authenticate, requirePermission('HR_PAYROLL_MANAGE'), controller.calculatePayroll);

export default router;
