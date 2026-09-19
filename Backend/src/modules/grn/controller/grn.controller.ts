import { Request, Response, NextFunction } from 'express';
import { GRNService } from '../service/grn.service.js';
import { createGRNSchema, recordGRNPaymentSchema } from '../validator/grn.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';
import { AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';
import { ForbiddenError } from '../../../common/errors/app-error.js';

export class GRNController {
  private grnService: GRNService;

  constructor() {
    this.grnService = new GRNService();
  }

  getGRNs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      let grns = await this.grnService.getAllGRNs();

      // Filter by authorized branches for non-admin users
      if (user && user.role !== 'ADMINISTRATOR') {
        const userBranches = user.branchIds || (user.branchId ? [user.branchId] : [1]);
        grns = grns.filter((g) => userBranches.includes(g.branchId));
      }

      res.status(200).json(ApiResponse.success(grns, 'GRN list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getGRNById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = (req as AuthenticatedRequest).user;
      const grn = await this.grnService.getGRNById(id);

      // Verify branch isolation
      if (user && user.role !== 'ADMINISTRATOR') {
        const userBranches = user.branchIds || (user.branchId ? [user.branchId] : [1]);
        if (!userBranches.includes(grn.branchId)) {
          throw new ForbiddenError(`Access denied: User is not authorized to access GRN for Branch ID ${grn.branchId}`);
        }
      }

      res.status(200).json(ApiResponse.success(grn, 'GRN details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createGRN = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createGRNSchema.parse(req.body);
      const user = (req as AuthenticatedRequest).user;
      const branchId = validatedData.branchId || (user?.branchId || 1);

      // Verify branch authorization for creation
      if (user && user.role !== 'ADMINISTRATOR') {
        const userBranches = user.branchIds || (user.branchId ? [user.branchId] : [1]);
        if (!userBranches.includes(branchId)) {
          throw new ForbiddenError(`Access denied: User is not authorized to create GRN for Branch ID ${branchId}`);
        }
      }

      const newGRN = await this.grnService.createGRN({ ...validatedData, branchId });
      res.status(201).json(ApiResponse.success(newGRN, 'Goods Received Note (GRN) logged successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  recordPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = recordGRNPaymentSchema.parse(req.body);
      const user = (req as AuthenticatedRequest).user;
      const userId = user?.userId || 1;

      // Verify branch isolation before payment
      const grn = await this.grnService.getGRNById(id);
      if (user && user.role !== 'ADMINISTRATOR') {
        const userBranches = user.branchIds || (user.branchId ? [user.branchId] : [1]);
        if (!userBranches.includes(grn.branchId)) {
          throw new ForbiddenError(`Access denied: User is not authorized to settle GRN for Branch ID ${grn.branchId}`);
        }
      }

      const updatedGRN = await this.grnService.recordPayment(id, validatedData, userId);
      res.status(200).json(ApiResponse.success(updatedGRN, 'GRN payment recorded successfully'));
    } catch (error) {
      next(error);
    }
  };
}
