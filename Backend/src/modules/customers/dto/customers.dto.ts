export interface CreateCustomerDto {
  name: string;
  mobile: string;
  email?: string;
  groupId?: number;
  creditLimit?: number;
}

export interface CustomerResponseDto {
  id: number;
  customerCode: string;
  name: string;
  mobile: string;
  email: string | null;
  groupId: number;
  groupName: string;
  loyaltyPoints: number;
  outstandingBalance: number;
  creditLimit: number;
  createdAt: Date;
}

export interface CreateCustomerGroupDto {
  name: string;
  discountRate?: number;
}

export interface UpdateCustomerGroupDto {
  name?: string;
  discountRate?: number;
}

export interface CustomerGroupResponseDto {
  id: number;
  name: string;
  discountRate: number;
}
