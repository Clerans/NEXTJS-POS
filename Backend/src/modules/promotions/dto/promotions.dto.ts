export interface CreatePromotionDto {
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FLAT' | 'BUY_X_GET_Y';
  discountValue: number;
  startDate: string;
  endDate: string;
}

export interface SendSmsCampaignDto {
  customerGroupId?: number;
  messageText: string;
}

export interface PromotionResponseDto {
  id: number;
  code: string;
  name: string;
  type: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED';
  createdAt: Date;
}

export interface SmsCampaignResponseDto {
  id: number;
  recipientsCount: number;
  messageText: string;
  status: 'SENT';
  sentAt: Date;
}
