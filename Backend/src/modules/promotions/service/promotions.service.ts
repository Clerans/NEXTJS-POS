import { PromotionRepository } from '../repository/promotions.repository.js';
import { CreatePromotionDto, SendSmsCampaignDto, PromotionResponseDto, SmsCampaignResponseDto } from '../dto/promotions.dto.js';
import { ConflictError, BadRequestError } from '../../../common/errors/app-error.js';

export class PromotionService {
  private promotionRepository: PromotionRepository;

  constructor() {
    this.promotionRepository = new PromotionRepository();
  }

  async getAllPromotions(): Promise<PromotionResponseDto[]> {
    return await this.promotionRepository.findAll();
  }

  async createPromotion(dto: CreatePromotionDto): Promise<PromotionResponseDto> {
    const existing = await this.promotionRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictError(`Promo code '${dto.code}' is already active`);
    }

    if (new Date(dto.startDate) > new Date(dto.endDate)) {
      throw new BadRequestError('Promotion start date cannot be after end date');
    }

    return await this.promotionRepository.create(dto);
  }

  async togglePromotionStatus(id: number, status: string): Promise<PromotionResponseDto> {
    return await this.promotionRepository.toggleStatus(id, status);
  }

  async deletePromotion(id: number): Promise<void> {
    await this.promotionRepository.delete(id);
  }

  async sendSmsCampaign(dto: SendSmsCampaignDto): Promise<SmsCampaignResponseDto> {
    return await this.promotionRepository.createSmsCampaign(dto);
  }
}
