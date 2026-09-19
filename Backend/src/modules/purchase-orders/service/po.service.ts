import { PORepository } from '../repository/po.repository.js';
import { AuthService } from '../../auth/service/auth.service.js';
import { CreatePODto, ApprovePODto, POResponseDto } from '../dto/po.dto.js';
import { NotFoundError, ForbiddenError, UnprocessableEntityError } from '../../../common/errors/app-error.js';

const APPROVAL_THRESHOLD = 100000; // POs > LKR 100,000 require manager approval

export class POService {
  private poRepository: PORepository;
  private authService: AuthService;

  constructor() {
    this.poRepository = new PORepository();
    this.authService = new AuthService();
  }

  async getAllPOs(): Promise<POResponseDto[]> {
    return await this.poRepository.findAll();
  }

  async getPOById(id: number): Promise<POResponseDto> {
    const po = await this.poRepository.findById(id);
    if (!po) {
      throw new NotFoundError(`Purchase Order #${id} not found`);
    }
    return po;
  }

  async createPO(dto: CreatePODto): Promise<POResponseDto> {
    if (!dto.items || dto.items.length === 0) {
      throw new UnprocessableEntityError('Purchase order must contain at least one item');
    }

    const totalAmount = dto.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    const poNumber = `PO-2026-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;

    const initialStatus = totalAmount > APPROVAL_THRESHOLD ? 'PENDING_APPROVAL' : 'APPROVED';
    return await this.poRepository.create(dto, poNumber, totalAmount, initialStatus);
  }

  async approvePO(dto: ApprovePODto, userId: number = 1): Promise<void> {
    const po = await this.poRepository.findById(dto.poId);
    if (!po) {
      throw new NotFoundError(`Purchase Order #${dto.poId} not found`);
    }

    if (po.status === 'APPROVED' || po.status === 'FULLY_RECEIVED' || po.status === 'CLOSED') {
      throw new UnprocessableEntityError(`Purchase Order #${dto.poId} is already ${po.status}`);
    }

    if (po.totalAmount > APPROVAL_THRESHOLD) {
      if (!dto.managerPin) {
        throw new ForbiddenError('High-value Purchase Order requires Manager PIN approval');
      }
      const isValid = await this.authService.verifyPin(dto.managerPin, userId);
      if (!isValid) {
        throw new ForbiddenError('Invalid Manager PIN code for Purchase Order approval');
      }
    }

    await this.poRepository.updateStatus(dto.poId, 'APPROVED');
  }

  async updatePOStatus(
    id: number,
    targetStatus: 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'CLOSED',
    userId: number = 1
  ): Promise<POResponseDto> {
    const po = await this.poRepository.findById(id);
    if (!po) {
      throw new NotFoundError(`Purchase Order #${id} not found`);
    }

    const currentStatus = po.status;

    // Terminal status enforcement
    if (currentStatus === 'FULLY_RECEIVED' || currentStatus === 'CLOSED' || currentStatus === 'CANCELLED' || currentStatus === 'REJECTED') {
      throw new UnprocessableEntityError(
        `Cannot change status of Purchase Order #${id} because it is already in terminal state '${currentStatus}'`
      );
    }

    // State machine transition validation
    if (targetStatus === 'APPROVED' || targetStatus === 'REJECTED') {
      if (currentStatus !== 'PENDING_APPROVAL' && currentStatus !== 'DRAFT') {
        throw new UnprocessableEntityError(
          `Cannot transition Purchase Order #${id} from status '${currentStatus}' to '${targetStatus}'`
        );
      }
    }

    if (targetStatus === 'CANCELLED') {
      if (currentStatus === 'PARTIALLY_RECEIVED') {
        throw new UnprocessableEntityError(
          `Cannot cancel Purchase Order #${id} with partially received goods. Close the order instead.`
        );
      }
    }

    await this.poRepository.updateStatus(id, targetStatus);

    const updated = await this.poRepository.findById(id);
    if (!updated) {
      throw new NotFoundError(`Purchase Order #${id} not found after status update`);
    }
    return updated;
  }
}
