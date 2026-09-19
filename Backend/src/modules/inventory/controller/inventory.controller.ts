import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../service/inventory.service.js';
import { adjustStockSchema } from '../validator/inventory.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';
import { AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';
import { ForbiddenError } from '../../../common/errors/app-error.js';

export class InventoryController {
  private inventoryService: InventoryService;

  constructor() {
    this.inventoryService = new InventoryService();
  }

  getStockLevels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const branchIdParam = req.query.branchId as string;

      let requestedBranchId: number | undefined;
      if (branchIdParam && branchIdParam !== 'All' && branchIdParam !== '0') {
        requestedBranchId = parseInt(branchIdParam, 10);
      }

      let targetBranchId: number | undefined = requestedBranchId;

      if (user && user.role !== 'ADMINISTRATOR') {
        const userBranchId = user.branchId || (user.branchIds && user.branchIds[0]) || 1;

        if (requestedBranchId !== undefined && requestedBranchId !== userBranchId) {
          throw new ForbiddenError(`Access denied: User is not authorized to access Branch ID ${requestedBranchId} inventory`);
        }

        targetBranchId = userBranchId;
      }

      const stock = await this.inventoryService.getStockLevels(targetBranchId);
      res.status(200).json(ApiResponse.success(stock, 'Stock balances retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getLedger = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ledger = await this.inventoryService.getLedgerEntries();
      res.status(200).json(ApiResponse.success(ledger, 'Inventory ledger retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  stockIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.userId || 1;
      const result = await this.inventoryService.recordStockIn({
        ...req.body,
        userId,
      });

      res.status(201).json(ApiResponse.success(result, 'Stock In recorded successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  stockOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.userId || 1;
      const result = await this.inventoryService.recordStockOut({
        ...req.body,
        userId,
      });

      res.status(200).json(ApiResponse.success(result, 'Stock Out recorded successfully'));
    } catch (error) {
      next(error);
    }
  };

  stockTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.user?.userId || 1;
      await this.inventoryService.recordStockTransfer({
        ...req.body,
        userId,
      });

      res.status(200).json(ApiResponse.success(null, 'Stock transfer completed successfully'));
    } catch (error) {
      next(error);
    }
  };

  createAdjustment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const body = req.body;

      if (user && user.role !== 'ADMINISTRATOR') {
        const userBranchId = user.branchId || (user.branchIds && user.branchIds[0]) || 1;
        if (body.branchId && Number(body.branchId) !== userBranchId) {
          throw new ForbiddenError(`Access denied: Cannot adjust inventory for Branch ID ${body.branchId}`);
        }
      }

      const userId = user?.userId || 1;
      await this.inventoryService.createStockAdjustment({
        ...body,
        userId,
      });

      res.status(201).json(ApiResponse.success(null, 'Stock adjustment processed successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  getAlerts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const branchIdParam = req.query.branchId as string;

      let requestedBranchId: number | undefined;
      if (branchIdParam && branchIdParam !== 'All' && branchIdParam !== '0') {
        requestedBranchId = parseInt(branchIdParam, 10);
      }

      let targetBranchId: number | undefined = requestedBranchId;

      if (user && user.role !== 'ADMINISTRATOR') {
        const userBranchId = user.branchId || (user.branchIds && user.branchIds[0]) || 1;
        if (requestedBranchId !== undefined && requestedBranchId !== userBranchId) {
          throw new ForbiddenError(`Access denied: User is not authorized to access Branch ID ${requestedBranchId} alerts`);
        }
        targetBranchId = userBranchId;
      }

      const alerts = await this.inventoryService.getStockAlerts(targetBranchId);
      res.status(200).json(ApiResponse.success(alerts, 'Stock alerts retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as AuthenticatedRequest).user;
      const validatedData = adjustStockSchema.parse(req.body);

      if (user && user.role !== 'ADMINISTRATOR') {
        const userBranchId = user.branchId || (user.branchIds && user.branchIds[0]) || 1;
        if (validatedData.branchId !== userBranchId) {
          throw new ForbiddenError(`Access denied: Cannot adjust inventory for Branch ID ${validatedData.branchId}`);
        }
      }

      const userId = user?.userId || 1;
      const entry = await this.inventoryService.adjustStock(validatedData, userId);

      res.status(201).json(ApiResponse.success(entry, 'Stock balance adjusted cleanly', 201));
    } catch (error) {
      next(error);
    }
  };

  toggleProductStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const newStatus = await this.inventoryService.toggleProductStatus(id);

      res.status(200).json(ApiResponse.success({ isActive: newStatus }, 'Product status toggled successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteInventoryItem = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.inventoryService.deleteInventoryItem(id);

      res.status(200).json(ApiResponse.success(null, 'Inventory stock entry deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
