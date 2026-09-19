export interface CreateBranchDto {
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UpdateBranchDto {
  code?: string;
  name?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export interface BranchResponseDto {
  id: number;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: Date;
}
