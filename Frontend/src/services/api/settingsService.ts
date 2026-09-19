import { api } from './axiosInstance';

export interface SystemSettings {
  branchId: number;
  storeName: string;
  receiptHeader: string;
  receiptFooter: string;
  taxPercentage: number;
  currencySymbol: string;
  isNegativeStockAllowed: boolean;
  updatedAt?: string;
}

export interface AuditLogRecord {
  id: number;
  userId: number;
  username: string;
  action: string;
  entityName: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  ipAddress: string;
  createdAt: string;
}

export const settingsService = {
  async getSettings(branchId: number = 1): Promise<SystemSettings> {
    try {
      const response = await api.get(`/settings/settings?branchId=${branchId}`);
      return response.data.data || response.data;
    } catch {
      const response = await api.get(`/settings?branchId=${branchId}`);
      return response.data.data || response.data;
    }
  },

  async updateSettings(settingsData: Partial<SystemSettings>, branchId: number = 1): Promise<SystemSettings> {
    try {
      const response = await api.put(`/settings/settings?branchId=${branchId}`, settingsData);
      return response.data.data || response.data;
    } catch {
      const response = await api.put(`/settings?branchId=${branchId}`, settingsData);
      return response.data.data || response.data;
    }
  },

  async getAuditLogs(): Promise<AuditLogRecord[]> {
    try {
      const response = await api.get('/settings/audit-logs');
      return response.data.data || response.data;
    } catch {
      const response = await api.get('/settings/audit-logs');
      return response.data.data || response.data;
    }
  },
};
