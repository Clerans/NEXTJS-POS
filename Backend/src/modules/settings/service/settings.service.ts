import { SettingRepository } from '../repository/settings.repository.js';
import { UpdateSettingsDto, SystemSettingsResponseDto, AuditLogResponseDto } from '../dto/settings.dto.js';

export class SettingService {
  private settingRepository: SettingRepository;

  constructor() {
    this.settingRepository = new SettingRepository();
  }

  async getSettings(branchId: number = 1): Promise<SystemSettingsResponseDto> {
    return await this.settingRepository.getSettings(branchId);
  }

  async updateSettings(dto: UpdateSettingsDto, branchId: number = 1): Promise<SystemSettingsResponseDto> {
    return await this.settingRepository.updateSettings(dto, branchId);
  }

  async getAuditLogs(): Promise<AuditLogResponseDto[]> {
    return await this.settingRepository.getAuditLogs();
  }
}
