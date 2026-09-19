export interface CreateVipRoomDto {
  branchId: number;
  name: string;
  category?: 'Small' | 'Medium' | 'Large';
  hourlyRate: number;
  discountPercentage?: number;
  isActive?: boolean;
}

export interface UpdateVipRoomDto {
  branchId?: number;
  name?: string;
  category?: 'Small' | 'Medium' | 'Large';
  hourlyRate?: number;
  discountPercentage?: number;
  isActive?: boolean;
}

export interface VipRoomResponseDto {
  id: number;
  branchId: number;
  branchName: string | null;
  name: string;
  category: 'Small' | 'Medium' | 'Large';
  hourlyRate: number;
  discountPercentage: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
