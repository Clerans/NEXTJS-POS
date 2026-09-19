export interface CreateUserDto {
  username: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  roleId: number;
  branchIds?: number[];
  pinCode?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  roleId?: number;
  branchIds?: number[];
  pinCode?: string;
  isActive?: boolean;
}

export interface UserResponseDto {
  id: number;
  username: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: {
    id: number;
    name: string;
  };
  branches: Array<{
    id: number;
    name: string;
  }>;
  isActive: boolean;
  createdAt: Date;
}
