import { api } from './axiosInstance';

export interface Promotion {
  id: number;
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FLAT' | 'BUY_X_GET_Y' | string;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: string;
  createdAt?: string;
}

export interface CreatePromotionPayload {
  code: string;
  name: string;
  type: 'PERCENTAGE' | 'FLAT' | 'BUY_X_GET_Y';
  discountValue: number;
  startDate: string;
  endDate: string;
}

export interface SendSmsCampaignPayload {
  customerGroupId?: number;
  messageText: string;
}

export interface SmsCampaignResponse {
  id: number;
  recipientsCount: number;
  messageText: string;
  status: string;
  sentAt?: string;
}

export const promotionsService = {
  async getAll(): Promise<Promotion[]> {
    const response = await api.get('/promotions');
    return response.data.data || response.data;
  },

  async create(promoData: CreatePromotionPayload): Promise<Promotion> {
    const response = await api.post('/promotions', promoData);
    return response.data.data || response.data;
  },

  async toggleStatus(id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<Promotion> {
    const response = await api.patch(`/promotions/${id}/status`, { status });
    return response.data.data || response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/promotions/${id}`);
  },

  async sendSmsCampaign(campaignData: SendSmsCampaignPayload): Promise<SmsCampaignResponse> {
    const response = await api.post('/promotions/sms-campaigns', campaignData);
    return response.data.data || response.data;
  },
};
