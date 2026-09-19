import { Request, Response, NextFunction } from 'express';
import { POService } from '../service/po.service.js';
import { createPOSchema, approvePOSchema, updatePOStatusSchema } from '../validator/po.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';
import { AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';

export class POController {
  private poService: POService;

  constructor() {
    this.poService = new POService();
  }

  getPOs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pos = await this.poService.getAllPOs();
      res.status(200).json(ApiResponse.success(pos, 'Purchase Orders list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getPOById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const po = await this.poService.getPOById(id);
      res.status(200).json(ApiResponse.success(po, 'Purchase Order details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createPO = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createPOSchema.parse(req.body);
      const newPO = await this.poService.createPO(validatedData);
      res.status(201).json(ApiResponse.success(newPO, 'Purchase Order generated cleanly', 201));
    } catch (error) {
      next(error);
    }
  };

  approvePO = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = approvePOSchema.parse(req.body);
      await this.poService.approvePO(validatedData);
      res.status(200).json(ApiResponse.success(null, 'Purchase Order approved successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updatePOStatusSchema.parse(req.body);
      const userId = (req as AuthenticatedRequest).user?.userId || 1;
      const updatedPO = await this.poService.updatePOStatus(id, validatedData.status, userId);
      res.status(200).json(ApiResponse.success(updatedPO, `Purchase Order status updated to ${validatedData.status}`));
    } catch (error) {
      next(error);
    }
  };
}
