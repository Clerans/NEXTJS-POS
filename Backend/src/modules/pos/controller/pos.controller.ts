import { Request, Response, NextFunction } from 'express';
import { POSService } from '../service/pos.service.js';
import { createPOSOrderSchema, voidOrderSchema, updateKDSStatusSchema, salesQueryFilterSchema } from '../validator/pos.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';
import { AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';

export class POSController {
  private posService: POSService;

  constructor() {
    this.posService = new POSService();
  }

  processOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createPOSOrderSchema.parse(req.body);
      const cashierId = (req as AuthenticatedRequest).user?.userId || 1;
      const userRole = (req as AuthenticatedRequest).user?.role || 'CASHIER';
      const offlineRef = (req.headers['x-offline-ref'] || req.headers['idempotency-key']) as string | undefined;

      const order = await this.posService.processOrder(validatedData, cashierId, userRole, offlineRef);

      res.status(200).json(ApiResponse.success(order, 'Order processed and ticket settled'));
    } catch (error) {
      next(error);
    }
  };

  voidOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = voidOrderSchema.parse(req.body);
      const userId = (req as AuthenticatedRequest).user?.userId || 1;
      await this.posService.voidOrder(validatedData, userId);

      res.status(200).json(ApiResponse.success(null, 'Order ticket voided successfully'));
    } catch (error) {
      next(error);
    }
  };

  getKDSOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tickets = await this.posService.getKDSOrders();
      res.status(200).json(ApiResponse.success(tickets, 'Barista KDS tickets retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateKDSStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = req.params.orderId;
      const { status } = updateKDSStatusSchema.parse(req.body);
      await this.posService.updateKDSStatus(orderId, status);
      res.status(200).json(ApiResponse.success({ orderId, status }, `KDS status updated to ${status}`));
    } catch (error) {
      next(error);
    }
  };

  getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = salesQueryFilterSchema.parse(req.query);
      const result = await this.posService.getAllOrders(filters);
      res.status(200).json(ApiResponse.success(result.data, 'Sales orders retrieved successfully', 200, result.meta));
    } catch (error) {
      next(error);
    }
  };

  getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const order = await this.posService.getOrderById(orderId);
      res.status(200).json(ApiResponse.success(order, 'Sales order details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getReceipt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orderId = parseInt(req.params.id, 10);
      const order = await this.posService.getOrderById(orderId);
      res.status(200).json(ApiResponse.success(order, 'Order receipt retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
