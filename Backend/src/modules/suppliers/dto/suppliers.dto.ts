export interface CreateSupplierDto {
  code: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  paymentTerms?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  paymentTerms?: string;
}

export interface SupplierResponseDto {
  id: number;
  code: string;
  name: string;
  contactPerson: string | null;
  phone: string;
  email: string | null;
  paymentTerms: string;
  createdAt: Date;
}
