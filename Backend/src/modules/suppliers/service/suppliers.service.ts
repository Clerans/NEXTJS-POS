import { SupplierRepository } from '../repository/suppliers.repository.js';
import { CreateSupplierDto, UpdateSupplierDto, SupplierResponseDto } from '../dto/suppliers.dto.js';
import { ConflictError, NotFoundError } from '../../../common/errors/app-error.js';

export class SupplierService {
  private supplierRepository: SupplierRepository;

  constructor() {
    this.supplierRepository = new SupplierRepository();
  }

  async getAllSuppliers(): Promise<SupplierResponseDto[]> {
    return await this.supplierRepository.findAll();
  }

  async getSupplierById(id: number): Promise<SupplierResponseDto> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier) {
      throw new NotFoundError(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async createSupplier(dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    const existing = await this.supplierRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictError(`Supplier code '${dto.code}' is already registered`);
    }

    return await this.supplierRepository.create(dto);
  }
}
