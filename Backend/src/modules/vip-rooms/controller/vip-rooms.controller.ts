import { Request, Response, NextFunction } from 'express';
import { VipRoomService } from '../service/vip-rooms.service.js';
import {
  createVipRoomSchema,
  updateVipRoomSchema,
} from '../validator/vip-rooms.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class VipRoomController {
  private service: VipRoomService;

  constructor() {
    this.service = new VipRoomService();
  }

  getRooms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId ? parseInt(req.query.branchId as string, 10) : undefined;
      const rooms = await this.service.getAllRooms(branchId);
      res.status(200).json(ApiResponse.success(rooms, 'VIP rooms retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getRoomById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const room = await this.service.getRoomById(id);
      res.status(200).json(ApiResponse.success(room, 'VIP room details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createVipRoomSchema.parse(req.body);
      const room = await this.service.createRoom(validatedData);
      res.status(201).json(ApiResponse.success(room, 'VIP room created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateVipRoomSchema.parse(req.body);
      const room = await this.service.updateRoom(id, validatedData);
      res.status(200).json(ApiResponse.success(room, 'VIP room updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const isActive = req.body.isActive !== false;
      const room = await this.service.updateStatus(id, isActive);
      res.status(200).json(ApiResponse.success(room, 'VIP room status updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.service.deleteRoom(id);
      res.status(200).json(ApiResponse.success(null, 'VIP room deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
