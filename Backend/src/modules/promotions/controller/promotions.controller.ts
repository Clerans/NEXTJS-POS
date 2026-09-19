import { Request, Response, NextFunction } from 'express';
import { PromotionService } from '../service/promotions.service.js';
import { createPromotionSchema, sendSmsCampaignSchema } from '../validator/promotions.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class PromotionController {
  private promotionService: PromotionService;

  constructor() {
    this.promotionService = new PromotionService();
  }

  getPromotions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const list = await this.promotionService.getAllPromotions();
      res.status(200).json(ApiResponse.success(list, 'Promotions list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createPromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createPromotionSchema.parse(req.body);
      const promo = await this.promotionService.createPromotion(validatedData);
      res.status(201).json(ApiResponse.success(promo, 'Promotion coupon created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  toggleStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const status = req.body.status || 'ACTIVE';
      const updated = await this.promotionService.togglePromotionStatus(id, status);
      res.status(200).json(ApiResponse.success(updated, `Promotion status updated to ${status}`));
    } catch (error) {
      next(error);
    }
  };

  deletePromotion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.promotionService.deletePromotion(id);
      res.status(200).json(ApiResponse.success(null, 'Promotion deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  sendSmsCampaign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = sendSmsCampaignSchema.parse(req.body);
      const campaign = await this.promotionService.sendSmsCampaign(validatedData);
      res.status(200).json(ApiResponse.success(campaign, 'SMS campaign dispatched successfully'));
    } catch (error) {
      next(error);
    }
  };
}
