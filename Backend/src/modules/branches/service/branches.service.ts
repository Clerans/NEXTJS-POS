import { BranchRepository } from '../repository/branches.repository.js';
import { CreateBranchDto, UpdateBranchDto, BranchResponseDto } from '../dto/branches.dto.js';
import { ConflictError, NotFoundError } from '../../../common/errors/app-error.js';

export class BranchService {
  private branchRepository: BranchRepository;

  constructor() {
    this.branchRepository = new BranchRepository();
  }

  async getAllBranches(): Promise<BranchResponseDto[]> {
    return await this.branchRepository.findAll();
  }

  async getBranchById(id: number): Promise<BranchResponseDto> {
    const branch = await this.branchRepository.findById(id);
    if (!branch) {
      throw new NotFoundError(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async createBranch(dto: CreateBranchDto): Promise<BranchResponseDto> {
    const existing = await this.branchRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictError(`Branch code '${dto.code}' already exists`);
    }

    return await this.branchRepository.create(dto);
  }

  async updateBranch(id: number, dto: UpdateBranchDto): Promise<BranchResponseDto> {
    const existing = await this.branchRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Branch with ID ${id} not found`);
    }

    if (dto.code && dto.code.toLowerCase() !== existing.code.toLowerCase()) {
      const codeConflict = await this.branchRepository.findByCode(dto.code);
      if (codeConflict) {
        throw new ConflictError(`Branch code '${dto.code}' is already used by another branch`);
      }
    }

    const updated = await this.branchRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Branch with ID ${id} not found`);
    }
    return updated;
  }

  async deleteBranch(id: number): Promise<void> {
    const existing = await this.branchRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Branch with ID ${id} not found`);
    }

    await this.branchRepository.delete(id);
  }
}
