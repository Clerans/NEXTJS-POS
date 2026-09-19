import { Request, Response, NextFunction } from 'express';
import { SettingService } from '../service/settings.service.js';
import { updateSettingsSchema } from '../validator/settings.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class SettingController {
  private settingService: SettingService;

  constructor() {
    this.settingService = new SettingService();
  }

  getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = parseInt(req.query.branchId as string, 10) || 1;
      const settings = await this.settingService.getSettings(branchId);
      res.status(200).json(ApiResponse.success(settings, 'System settings retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = updateSettingsSchema.parse(req.body);
      const branchId = parseInt(req.query.branchId as string, 10) || 1;
      const updated = await this.settingService.updateSettings(validatedData, branchId);

      res.status(200).json(ApiResponse.success(updated, 'System settings updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAuditLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const logs = await this.settingService.getAuditLogs();
      res.status(200).json(ApiResponse.success(logs, 'Audit logs retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };
}
