import { DiningTableRepository } from '../repository/tables.repository.js';
import {
  CreateDiningTableDto,
  UpdateDiningTableDto,
  DiningTableResponseDto,
} from '../dto/tables.dto.js';
import { NotFoundError, ConflictError } from '../../../common/errors/app-error.js';

export class DiningTableService {
  private repository: DiningTableRepository;

  constructor() {
    this.repository = new DiningTableRepository();
  }

  async getAllTables(branchId?: number): Promise<DiningTableResponseDto[]> {
    return await this.repository.findAll(branchId);
  }

  async getTableById(id: number): Promise<DiningTableResponseDto> {
    const table = await this.repository.findById(id);
    if (!table) {
      throw new NotFoundError(`Table with ID ${id} not found`);
    }
    return table;
  }

  async createTable(dto: CreateDiningTableDto): Promise<DiningTableResponseDto> {
    const existing = await this.repository.findByBranchAndNumber(dto.branchId, dto.tableNumber);
    if (existing) {
      throw new ConflictError(`Table '${dto.tableNumber}' already exists for branch ID ${dto.branchId}`);
    }
    return await this.repository.create(dto);
  }

  async updateTable(id: number, dto: UpdateDiningTableDto): Promise<DiningTableResponseDto> {
    await this.getTableById(id);

    if (dto.branchId && dto.tableNumber) {
      const existing = await this.repository.findByBranchAndNumber(dto.branchId, dto.tableNumber);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Table '${dto.tableNumber}' already exists for branch ID ${dto.branchId}`);
      }
    }

    const updated = await this.repository.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Table with ID ${id} not found`);
    }
    return updated;
  }

  async updateAvailability(id: number, availability: 'AVAILABLE' | 'OCCUPIED'): Promise<DiningTableResponseDto> {
    return await this.updateTable(id, { availability });
  }

  async deleteTable(id: number): Promise<void> {
    await this.getTableById(id);
    await this.repository.delete(id);
  }
}
