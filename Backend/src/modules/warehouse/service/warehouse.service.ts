import { WarehouseRepository } from '../repository/warehouse.repository.js';
import {
  CreateTransferDto,
  UpdateTransferStatusDto,
  TransferResponseDto,
  CreateProductionDto,
  ProductionResponseDto,
} from '../dto/warehouse.dto.js';
import { NotFoundError, BadRequestError } from '../../../common/errors/app-error.js';

export class WarehouseService {
  private warehouseRepository: WarehouseRepository;

  constructor() {
    this.warehouseRepository = new WarehouseRepository();
  }

  async getAllTransfers(): Promise<TransferResponseDto[]> {
    return await this.warehouseRepository.findAllTransfers();
  }

  async getTransferById(id: number): Promise<TransferResponseDto> {
    const transfer = await this.warehouseRepository.findTransferById(id);
    if (!transfer) {
      throw new NotFoundError(`Stock transfer #${id} not found`);
    }
    return transfer;
  }

  async createTransfer(dto: CreateTransferDto): Promise<TransferResponseDto> {
    if (dto.sourceWarehouseId === dto.destinationWarehouseId) {
      throw new BadRequestError('Source and destination warehouses cannot be the same');
    }

    const transferNo = `TR-2026-${Date.now().toString().slice(-6)}`;
    return await this.warehouseRepository.createTransfer(dto, transferNo);
  }

  async completeTransfer(id: number, userId: number = 1): Promise<TransferResponseDto> {
    const transfer = await this.warehouseRepository.findTransferById(id);
    if (!transfer) {
      throw new NotFoundError(`Stock transfer #${id} not found`);
    }

    return await this.warehouseRepository.completeTransfer(id, userId);
  }

  async cancelTransfer(id: number, userId: number = 1): Promise<TransferResponseDto> {
    const transfer = await this.warehouseRepository.findTransferById(id);
    if (!transfer) {
      throw new NotFoundError(`Stock transfer #${id} not found`);
    }

    return await this.warehouseRepository.cancelTransfer(id, userId);
  }

  async updateTransferStatus(dto: UpdateTransferStatusDto): Promise<void> {
    const transfer = await this.warehouseRepository.findTransferById(dto.transferId);
    if (!transfer) {
      throw new NotFoundError(`Stock transfer #${dto.transferId} not found`);
    }

    await this.warehouseRepository.updateTransferStatus(dto.transferId, dto.status);
  }

  // --- PRODUCTIONS ---

  async getAllProductions(): Promise<ProductionResponseDto[]> {
    return await this.warehouseRepository.findAllProductions();
  }

  async getProductionById(id: number): Promise<ProductionResponseDto> {
    const production = await this.warehouseRepository.findProductionById(id);
    if (!production) {
      throw new NotFoundError(`Warehouse production #${id} not found`);
    }
    return production;
  }

  async createProduction(dto: CreateProductionDto, userId: number = 1): Promise<ProductionResponseDto> {
    if (dto.quantity <= 0) {
      throw new BadRequestError('Production quantity must be greater than 0');
    }
    return await this.warehouseRepository.createProduction(dto, userId);
  }
}
