import { Request, Response, NextFunction } from 'express';
import { SupplierService } from '../service/suppliers.service.js';
import { createSupplierSchema } from '../validator/suppliers.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class SupplierController {
  private supplierService: SupplierService;

  constructor() {
    this.supplierService = new SupplierService();
  }

  getSuppliers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const suppliers = await this.supplierService.getAllSuppliers();
      res.status(200).json(ApiResponse.success(suppliers, 'Suppliers list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getSupplierById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const supplier = await this.supplierService.getSupplierById(id);
      res.status(200).json(ApiResponse.success(supplier, 'Supplier details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createSupplier = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createSupplierSchema.parse(req.body);
      const supplier = await this.supplierService.createSupplier(validatedData);
      res.status(201).json(ApiResponse.success(supplier, 'Supplier created successfully', 201));
    } catch (error) {
      next(error);
    }
  };
}
