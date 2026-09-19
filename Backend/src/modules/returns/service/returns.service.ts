import { ReturnRepository } from '../repository/returns.repository.js';
import { CreateCustomerReturnDto, CreateSupplierReturnDto, ReturnResponseDto } from '../dto/returns.dto.js';

export class ReturnService {
  private returnRepository: ReturnRepository;

  constructor() {
    this.returnRepository = new ReturnRepository();
  }

  async getAllReturns(): Promise<ReturnResponseDto[]> {
    return await this.returnRepository.findAll();
  }

  async processCustomerReturn(dto: CreateCustomerReturnDto, userId: number = 1): Promise<ReturnResponseDto> {
    const totalRefund = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const returnNo = `RET-CUST-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    return await this.returnRepository.createCustomerReturn(dto, returnNo, totalRefund, userId);
  }

  async processSupplierReturn(dto: CreateSupplierReturnDto, userId: number = 1): Promise<ReturnResponseDto> {
    const totalRefund = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const returnNo = `RET-SUP-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    return await this.returnRepository.createSupplierReturn(dto, returnNo, totalRefund, userId);
  }
}
