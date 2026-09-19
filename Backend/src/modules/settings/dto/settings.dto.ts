export interface UpdateSettingsDto {
  storeName?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  taxPercentage?: number;
  currencySymbol?: string;
  isNegativeStockAllowed?: boolean;
}

export interface SystemSettingsResponseDto {
  branchId: number;
  storeName: string;
  receiptHeader: string;
  receiptFooter: string;
  taxPercentage: number;
  currencySymbol: string;
  isNegativeStockAllowed: boolean;
  updatedAt: Date;
}

export interface AuditLogResponseDto {
  id: number;
  userId: number;
  username: string;
  action: string;
  entityName: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  ipAddress: string;
  createdAt: Date;
}
