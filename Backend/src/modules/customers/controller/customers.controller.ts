import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../service/customers.service.js';
import {
  createCustomerSchema,
  createCustomerGroupSchema,
  updateCustomerGroupSchema,
} from '../validator/customers.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  getCustomers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customers = await this.customerService.getAllCustomers();
      res.status(200).json(ApiResponse.success(customers, 'Customers list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getCustomerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const customer = await this.customerService.getCustomerById(id);
      res.status(200).json(ApiResponse.success(customer, 'Customer details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createCustomer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createCustomerSchema.parse(req.body);
      const customer = await this.customerService.createCustomer(validatedData);
      res.status(201).json(ApiResponse.success(customer, 'Customer account created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  // --- CUSTOMER GROUPS CONTROLLER HANDLERS ---

  getGroups = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const groups = await this.customerService.getAllGroups();
      res.status(200).json(ApiResponse.success(groups, 'Customer groups list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getGroupById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const group = await this.customerService.getGroupById(id);
      res.status(200).json(ApiResponse.success(group, 'Customer group details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createCustomerGroupSchema.parse(req.body);
      const group = await this.customerService.createGroup(validatedData);
      res.status(201).json(ApiResponse.success(group, 'Customer group created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateCustomerGroupSchema.parse(req.body);
      const group = await this.customerService.updateGroup(id, validatedData);
      res.status(200).json(ApiResponse.success(group, 'Customer group updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteGroup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.customerService.deleteGroup(id);
      res.status(200).json(ApiResponse.success(null, 'Customer group deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
