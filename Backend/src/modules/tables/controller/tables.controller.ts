import { Request, Response, NextFunction } from 'express';
import { DiningTableService } from '../service/tables.service.js';
import {
  createDiningTableSchema,
  updateDiningTableSchema,
  updateTableAvailabilitySchema,
} from '../validator/tables.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class DiningTableController {
  private service: DiningTableService;

  constructor() {
    this.service = new DiningTableService();
  }

  getTables = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
      const tables = await this.service.getAllTables(branchId);
      res.status(200).json(ApiResponse.success(tables, 'Dining tables retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getTableById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const table = await this.service.getTableById(id);
      res.status(200).json(ApiResponse.success(table, 'Dining table details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createDiningTableSchema.parse(req.body);
      const table = await this.service.createTable(validatedData);
      res.status(201).json(ApiResponse.success(table, 'Dining table created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateDiningTableSchema.parse(req.body);
      const table = await this.service.updateTable(id, validatedData);
      res.status(200).json(ApiResponse.success(table, 'Dining table updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateTableAvailabilitySchema.parse(req.body);
      const table = await this.service.updateAvailability(id, validatedData.availability);
      res.status(200).json(ApiResponse.success(table, 'Dining table availability updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.service.deleteTable(id);
      res.status(200).json(ApiResponse.success(null, 'Dining table deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
