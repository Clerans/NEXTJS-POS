import { Request, Response, NextFunction } from 'express';
import { UserService } from '../service/users.service.js';
import { createUserSchema, updateUserSchema } from '../validator/users.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json(ApiResponse.success(users, 'Users retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await this.userService.getUserById(id);
      res.status(200).json(ApiResponse.success(user, 'User details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const newUser = await this.userService.createUser(validatedData);
      res.status(201).json(ApiResponse.success(newUser, 'User created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateUserSchema.parse(req.body);
      const updatedUser = await this.userService.updateUser(id, validatedData);
      res.status(200).json(ApiResponse.success(updatedUser, 'User updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.userService.deleteUser(id);
      res.status(200).json(ApiResponse.success(null, 'User deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
