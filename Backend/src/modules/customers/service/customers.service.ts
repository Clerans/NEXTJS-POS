import { CustomerRepository } from '../repository/customers.repository.js';
import {
  CreateCustomerDto,
  CustomerResponseDto,
  CreateCustomerGroupDto,
  UpdateCustomerGroupDto,
  CustomerGroupResponseDto,
} from '../dto/customers.dto.js';
import { ConflictError, NotFoundError } from '../../../common/errors/app-error.js';

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor() {
    this.customerRepository = new CustomerRepository();
  }

  async getAllCustomers(): Promise<CustomerResponseDto[]> {
    return await this.customerRepository.findAll();
  }

  async getCustomerById(id: number): Promise<CustomerResponseDto> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async createCustomer(dto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const existing = await this.customerRepository.findByMobile(dto.mobile);
    if (existing) {
      throw new ConflictError(`Mobile number '${dto.mobile}' is already registered to customer ${existing.name}`);
    }

    const customerCode = `CUST-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    return await this.customerRepository.create(dto, customerCode);
  }

  // --- CUSTOMER GROUPS SERVICE METHODS ---

  async getAllGroups(): Promise<CustomerGroupResponseDto[]> {
    return await this.customerRepository.findAllGroups();
  }

  async getGroupById(id: number): Promise<CustomerGroupResponseDto> {
    const group = await this.customerRepository.findGroupById(id);
    if (!group) {
      throw new NotFoundError(`Customer group with ID ${id} not found`);
    }
    return group;
  }

  async createGroup(dto: CreateCustomerGroupDto): Promise<CustomerGroupResponseDto> {
    const existing = await this.customerRepository.findGroupByName(dto.name);
    if (existing) {
      throw new ConflictError(`Customer group '${dto.name}' already exists`);
    }

    return await this.customerRepository.createGroup(dto);
  }

  async updateGroup(id: number, dto: UpdateCustomerGroupDto): Promise<CustomerGroupResponseDto> {
    const existing = await this.customerRepository.findGroupById(id);
    if (!existing) {
      throw new NotFoundError(`Customer group with ID ${id} not found`);
    }

    if (dto.name && dto.name.toLowerCase() !== existing.name.toLowerCase()) {
      const nameConflict = await this.customerRepository.findGroupByName(dto.name);
      if (nameConflict) {
        throw new ConflictError(`Customer group name '${dto.name}' is already in use`);
      }
    }

    const updated = await this.customerRepository.updateGroup(id, dto);
    if (!updated) {
      throw new NotFoundError(`Customer group with ID ${id} not found`);
    }
    return updated;
  }

  async deleteGroup(id: number): Promise<void> {
    const existing = await this.customerRepository.findGroupById(id);
    if (!existing) {
      throw new NotFoundError(`Customer group with ID ${id} not found`);
    }

    await this.customerRepository.deleteGroup(id);
  }
}
