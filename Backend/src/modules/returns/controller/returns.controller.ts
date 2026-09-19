import { Request, Response, NextFunction } from 'express';
import { ReturnService } from '../service/returns.service.js';
import { createCustomerReturnSchema, createSupplierReturnSchema } from '../validator/returns.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';
import { AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';

export class ReturnController {
  private returnService: ReturnService;

  constructor() {
    this.returnService = new ReturnService();
  }

  getReturns = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.returnService.getAllReturns();
      res.status(200).json(ApiResponse.success(list, 'Returns list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createCustomerReturn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createCustomerReturnSchema.parse(req.body);
      const userId = (req as AuthenticatedRequest).user?.userId || 1;
      const result = await this.returnService.processCustomerReturn(validatedData, userId);
      res.status(201).json(ApiResponse.success(result, 'Customer return processed & stock updated', 201));
    } catch (error) {
      next(error);
    }
  };

  createSupplierReturn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createSupplierReturnSchema.parse(req.body);
      const userId = (req as AuthenticatedRequest).user?.userId || 1;
      const result = await this.returnService.processSupplierReturn(validatedData, userId);
      res.status(201).json(ApiResponse.success(result, 'Supplier debit note & return logged cleanly', 201));
    } catch (error) {
      next(error);
    }
  };
}
