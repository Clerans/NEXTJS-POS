import { RawMaterialRepository } from '../repository/raw-materials.repository.js';
import {
  CreateRawMaterialDto,
  UpdateRawMaterialDto,
  RawMaterialResponseDto,
  CreateRawMaterialBatchDto,
  RawMaterialBatchResponseDto,
  RawMaterialInventoryResponseDto,
  AdjustRawMaterialStockDto,
} from '../dto/raw-materials.dto.js';
import { ConflictError, NotFoundError } from '../../../common/errors/app-error.js';

export class RawMaterialService {
  private repository: RawMaterialRepository;

  constructor() {
    this.repository = new RawMaterialRepository();
  }

  async getAllRawMaterials(): Promise<RawMaterialResponseDto[]> {
    return await this.repository.findAll();
  }

  async getRawMaterialById(id: number): Promise<RawMaterialResponseDto> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundError(`Raw material with ID ${id} not found`);
    }
    return item;
  }

  async createRawMaterial(dto: CreateRawMaterialDto): Promise<RawMaterialResponseDto> {
    const existing = await this.repository.findByCode(dto.code);
    if (existing) {
      throw new ConflictError(`Raw material code '${dto.code}' already exists`);
    }

    return await this.repository.create(dto);
  }

  async updateRawMaterial(id: number, dto: UpdateRawMaterialDto): Promise<RawMaterialResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Raw material with ID ${id} not found`);
    }

    if (dto.code && dto.code.toLowerCase() !== existing.code.toLowerCase()) {
      const codeConflict = await this.repository.findByCode(dto.code);
      if (codeConflict) {
        throw new ConflictError(`Raw material code '${dto.code}' is already used by another item`);
      }
    }

    const updated = await this.repository.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Raw material with ID ${id} not found`);
    }
    return updated;
  }

  async deleteRawMaterial(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Raw material with ID ${id} not found`);
    }

    await this.repository.delete(id);
  }

  // --- BATCHES & INVENTORY EXTENSIONS ---

  async getBatches(
    rawMaterialId?: number,
    warehouseId?: number
  ): Promise<RawMaterialBatchResponseDto[]> {
    return await this.repository.findBatches(rawMaterialId, warehouseId);
  }

  async createBatch(dto: CreateRawMaterialBatchDto): Promise<RawMaterialBatchResponseDto> {
    const rawMat = await this.repository.findById(dto.rawMaterialId);
    if (!rawMat) {
      throw new NotFoundError(`Raw material with ID ${dto.rawMaterialId} not found`);
    }

    return await this.repository.createBatch(dto);
  }

  async getInventory(
    rawMaterialId?: number,
    warehouseId?: number
  ): Promise<RawMaterialInventoryResponseDto[]> {
    return await this.repository.findInventory(rawMaterialId, warehouseId);
  }

  async adjustStock(dto: AdjustRawMaterialStockDto): Promise<RawMaterialInventoryResponseDto> {
    const rawMat = await this.repository.findById(dto.rawMaterialId);
    if (!rawMat) {
      throw new NotFoundError(`Raw material with ID ${dto.rawMaterialId} not found`);
    }

    return await this.repository.adjustStock(dto);
  }
}
