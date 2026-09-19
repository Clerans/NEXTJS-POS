import { GRNRepository } from '../repository/grn.repository.js';
import { CreateGRNDto, GRNResponseDto, RecordGRNPaymentDto } from '../dto/grn.dto.js';
import { NotFoundError } from '../../../common/errors/app-error.js';

export class GRNService {
  private grnRepository: GRNRepository;

  constructor() {
    this.grnRepository = new GRNRepository();
  }

  async getAllGRNs(): Promise<GRNResponseDto[]> {
    return await this.grnRepository.findAll();
  }

  async getGRNById(id: number): Promise<GRNResponseDto> {
    const grn = await this.grnRepository.findById(id);
    if (!grn) {
      throw new NotFoundError(`Goods Received Note (GRN) #${id} not found`);
    }
    return grn;
  }

  async createGRN(dto: CreateGRNDto, userId: number = 1): Promise<GRNResponseDto> {
    const totalAmount = dto.items.reduce((sum, item) => sum + (item.receivedQuantity * item.unitCost), 0);
    const grnNumber = `GRN-2026-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    return await this.grnRepository.create(dto, grnNumber, totalAmount, userId);
  }

  async recordPayment(id: number, dto: RecordGRNPaymentDto, userId: number = 1): Promise<GRNResponseDto> {
    const grn = await this.grnRepository.findById(id);
    if (!grn) {
      throw new NotFoundError(`Goods Received Note (GRN) #${id} not found`);
    }

    return await this.grnRepository.recordPayment(id, dto, userId);
  }
}
