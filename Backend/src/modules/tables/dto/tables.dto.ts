export interface CreateDiningTableDto {
  branchId: number;
  tableNumber: string;
  capacity?: number;
  availability?: 'AVAILABLE' | 'OCCUPIED';
  isActive?: boolean;
}

export interface UpdateDiningTableDto {
  branchId?: number;
  tableNumber?: string;
  capacity?: number;
  availability?: 'AVAILABLE' | 'OCCUPIED';
  isActive?: boolean;
}

export interface UpdateTableAvailabilityDto {
  availability: 'AVAILABLE' | 'OCCUPIED';
}

export interface DiningTableResponseDto {
  id: number;
  branchId: number;
  branchName: string | null;
  tableNumber: string;
  capacity: number;
  availability: 'AVAILABLE' | 'OCCUPIED';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
