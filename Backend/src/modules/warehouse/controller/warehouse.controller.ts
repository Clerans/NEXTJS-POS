import { Request, Response, NextFunction } from 'express';
import { WarehouseService } from '../service/warehouse.service.js';
import { createTransferSchema, updateTransferStatusSchema, createProductionSchema } from '../validator/warehouse.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';
import { AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';

export class WarehouseController {
  private warehouseService: WarehouseService;

  constructor() {
    this.warehouseService = new WarehouseService();
  }

  getTransfers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const transfers = await this.warehouseService.getAllTransfers();
      res.status(200).json(ApiResponse.success(transfers, 'Stock transfers retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getTransferById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const transfer = await this.warehouseService.getTransferById(id);
      res.status(200).json(ApiResponse.success(transfer, 'Stock transfer details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createTransferSchema.parse(req.body);
      const newTransfer = await this.warehouseService.createTransfer(validatedData);
      res.status(201).json(ApiResponse.success(newTransfer, 'Stock transfer initiated successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  completeTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = (req as AuthenticatedRequest).user?.userId || 1;
      const completed = await this.warehouseService.completeTransfer(id, userId);
      res.status(200).json(ApiResponse.success(completed, 'Stock transfer marked as completed and credited to destination'));
    } catch (error) {
      next(error);
    }
  };

  cancelTransfer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = (req as AuthenticatedRequest).user?.userId || 1;
      const cancelled = await this.warehouseService.cancelTransfer(id, userId);
      res.status(200).json(ApiResponse.success(cancelled, 'Stock transfer cancelled and returned to source warehouse'));
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = updateTransferStatusSchema.parse(req.body);
      await this.warehouseService.updateTransferStatus(validatedData);
      res.status(200).json(ApiResponse.success(null, 'Stock transfer status updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  // --- PRODUCTIONS ---

  getProductions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productions = await this.warehouseService.getAllProductions();
      res.status(200).json(ApiResponse.success(productions, 'Warehouse productions retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getProductionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const production = await this.warehouseService.getProductionById(id);
      res.status(200).json(ApiResponse.success(production, 'Warehouse production details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createProduction = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createProductionSchema.parse(req.body);
      const userId = (req as AuthenticatedRequest).user?.userId || 1;
      const newProduction = await this.warehouseService.createProduction(validatedData, userId);
      res.status(201).json(ApiResponse.success(newProduction, 'Warehouse production executed successfully', 201));
    } catch (error) {
      next(error);
    }
  };
}
