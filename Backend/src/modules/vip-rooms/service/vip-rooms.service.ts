import { VipRoomRepository } from '../repository/vip-rooms.repository.js';
import {
  CreateVipRoomDto,
  UpdateVipRoomDto,
  VipRoomResponseDto,
} from '../dto/vip-rooms.dto.js';
import { NotFoundError, ConflictError } from '../../../common/errors/app-error.js';

export class VipRoomService {
  private repository: VipRoomRepository;

  constructor() {
    this.repository = new VipRoomRepository();
  }

  async getAllRooms(branchId?: number): Promise<VipRoomResponseDto[]> {
    return await this.repository.findAll(branchId);
  }

  async getRoomById(id: number): Promise<VipRoomResponseDto> {
    const room = await this.repository.findById(id);
    if (!room) {
      throw new NotFoundError(`VIP Room with ID ${id} not found`);
    }
    return room;
  }

  async createRoom(dto: CreateVipRoomDto): Promise<VipRoomResponseDto> {
    const existing = await this.repository.findByBranchAndName(dto.branchId, dto.name);
    if (existing) {
      throw new ConflictError(`VIP Room '${dto.name}' already exists for branch ID ${dto.branchId}`);
    }
    return await this.repository.create(dto);
  }

  async updateRoom(id: number, dto: UpdateVipRoomDto): Promise<VipRoomResponseDto> {
    await this.getRoomById(id);

    if (dto.branchId && dto.name) {
      const existing = await this.repository.findByBranchAndName(dto.branchId, dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`VIP Room '${dto.name}' already exists for branch ID ${dto.branchId}`);
      }
    }

    const updated = await this.repository.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`VIP Room with ID ${id} not found`);
    }
    return updated;
  }

  async updateStatus(id: number, isActive: boolean): Promise<VipRoomResponseDto> {
    return await this.updateRoom(id, { isActive });
  }

  async deleteRoom(id: number): Promise<void> {
    await this.getRoomById(id);
    await this.repository.delete(id);
  }
}
