import { Request, Response, NextFunction } from 'express';
import { RawMaterialService } from '../service/raw-materials.service.js';
import {
  createRawMaterialSchema,
  updateRawMaterialSchema,
  createRawMaterialBatchSchema,
  adjustRawMaterialStockSchema,
} from '../validator/raw-materials.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class RawMaterialController {
  private service: RawMaterialService;

  constructor() {
    this.service = new RawMaterialService();
  }

  getRawMaterials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.getAllRawMaterials();
      res.status(200).json(ApiResponse.success(items, 'Raw materials list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getRawMaterialById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const item = await this.service.getRawMaterialById(id);
      res.status(200).json(ApiResponse.success(item, 'Raw material details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createRawMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createRawMaterialSchema.parse(req.body);
      const item = await this.service.createRawMaterial(validatedData);
      res.status(201).json(ApiResponse.success(item, 'Raw material created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateRawMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateRawMaterialSchema.parse(req.body);
      const item = await this.service.updateRawMaterial(id, validatedData);
      res.status(200).json(ApiResponse.success(item, 'Raw material updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteRawMaterial = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.service.deleteRawMaterial(id);
      res.status(200).json(ApiResponse.success(null, 'Raw material deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  // --- BATCHES & INVENTORY CONTROLLER HANDLERS ---

  getBatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawMaterialId = req.query.rawMaterialId ? parseInt(req.query.rawMaterialId as string, 10) : undefined;
      const warehouseId = req.query.warehouseId ? parseInt(req.query.warehouseId as string, 10) : undefined;

      const batches = await this.service.getBatches(rawMaterialId, warehouseId);
      res.status(200).json(ApiResponse.success(batches, 'Raw material batches retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createRawMaterialBatchSchema.parse(req.body);
      const batch = await this.service.createBatch(validatedData);
      res.status(201).json(ApiResponse.success(batch, 'Raw material batch recorded successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  getInventory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawMaterialId = req.query.rawMaterialId ? parseInt(req.query.rawMaterialId as string, 10) : undefined;
      const warehouseId = req.query.warehouseId ? parseInt(req.query.warehouseId as string, 10) : undefined;

      const inventory = await this.service.getInventory(rawMaterialId, warehouseId);
      res.status(200).json(ApiResponse.success(inventory, 'Raw material inventory levels retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = adjustRawMaterialStockSchema.parse(req.body);
      const inventory = await this.service.adjustStock(validatedData);
      res.status(200).json(ApiResponse.success(inventory, 'Raw material stock adjusted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
