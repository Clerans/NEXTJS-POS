import { Request, Response, NextFunction } from 'express';
import { BranchService } from '../service/branches.service.js';
import { createBranchSchema, updateBranchSchema } from '../validator/branches.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class BranchController {
  private branchService: BranchService;

  constructor() {
    this.branchService = new BranchService();
  }

  getBranches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branches = await this.branchService.getAllBranches();
      res.status(200).json(ApiResponse.success(branches, 'Branches list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getBranchById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const branch = await this.branchService.getBranchById(id);
      res.status(200).json(ApiResponse.success(branch, 'Branch details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createBranchSchema.parse(req.body);
      const branch = await this.branchService.createBranch(validatedData);
      res.status(201).json(ApiResponse.success(branch, 'Branch created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateBranchSchema.parse(req.body);
      const branch = await this.branchService.updateBranch(id, validatedData);
      res.status(200).json(ApiResponse.success(branch, 'Branch updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.branchService.deleteBranch(id);
      res.status(200).json(ApiResponse.success(null, 'Branch deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
