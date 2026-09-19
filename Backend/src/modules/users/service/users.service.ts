import bcrypt from 'bcryptjs';
import { UserRepository } from '../repository/users.repository.js';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../dto/users.dto.js';
import { NotFoundError, ConflictError } from '../../../common/errors/app-error.js';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers(): Promise<UserResponseDto[]> {
    return await this.userRepository.findAll();
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    return user;
  }

  async createUser(dto: CreateUserDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    let hashedPin: string | undefined = undefined;

    if (dto.pinCode) {
      hashedPin = await bcrypt.hash(dto.pinCode, 10);
    }

    try {
      return await this.userRepository.create(dto, hashedPassword, hashedPin);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictError(`Username '${dto.username}' already exists`);
      }
      throw error;
    }
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<UserResponseDto> {
    let hashedPin: string | undefined = undefined;
    if (dto.pinCode) {
      hashedPin = await bcrypt.hash(dto.pinCode, 10);
    }

    try {
      const updated = await this.userRepository.update(id, dto, hashedPin);
      if (!updated) {
        throw new NotFoundError(`User with ID ${id} not found`);
      }
      return updated;
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictError(`Email or phone number already in use by another user`);
      }
      throw error;
    }
  }

  async deleteUser(id: number): Promise<void> {
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
  }
}
