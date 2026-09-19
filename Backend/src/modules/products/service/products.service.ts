import { ProductRepository } from '../repository/products.repository.js';
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CreateUnitDto,
  UpdateUnitDto,
  UnitResponseDto,
} from '../dto/products.dto.js';
import { NotFoundError, ConflictError } from '../../../common/errors/app-error.js';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async getAllProducts(): Promise<ProductResponseDto[]> {
    return await this.productRepository.findAll();
  }

  async getProductById(id: number): Promise<ProductResponseDto> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }
    return product;
  }

  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    const existingSku = await this.productRepository.findBySku(dto.sku);
    if (existingSku) {
      throw new ConflictError(`Product SKU '${dto.sku}' already exists`);
    }

    try {
      return await this.productRepository.create(dto);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictError(`Product SKU '${dto.sku}' already exists`);
      }
      throw error;
    }
  }

  async updateProduct(id: number, dto: UpdateProductDto): Promise<ProductResponseDto> {
    const updated = await this.productRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }
    await this.productRepository.delete(id);
  }

  // --- CATEGORY SERVICE METHODS ---

  async getAllCategories(): Promise<CategoryResponseDto[]> {
    return await this.productRepository.findAllCategories();
  }

  async getCategoryById(id: number): Promise<CategoryResponseDto> {
    const category = await this.productRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
    return category;
  }

  async createCategory(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return await this.productRepository.createCategory(dto);
  }

  async updateCategory(id: number, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.productRepository.updateCategory(id, dto);
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    const category = await this.productRepository.findCategoryById(id);
    if (!category) {
      throw new NotFoundError(`Category with ID ${id} not found`);
    }
    await this.productRepository.deleteCategory(id);
  }

  // --- UNIT SERVICE METHODS ---

  async getAllUnits(): Promise<UnitResponseDto[]> {
    return await this.productRepository.findAllUnits();
  }

  async getUnitById(id: number): Promise<UnitResponseDto> {
    const unit = await this.productRepository.findUnitById(id);
    if (!unit) {
      throw new NotFoundError(`Unit with ID ${id} not found`);
    }
    return unit;
  }

  async createUnit(dto: CreateUnitDto): Promise<UnitResponseDto> {
    return await this.productRepository.createUnit(dto);
  }

  async updateUnit(id: number, dto: UpdateUnitDto): Promise<UnitResponseDto> {
    const unit = await this.productRepository.updateUnit(id, dto);
    if (!unit) {
      throw new NotFoundError(`Unit with ID ${id} not found`);
    }
    return unit;
  }

  async deleteUnit(id: number): Promise<void> {
    const unit = await this.productRepository.findUnitById(id);
    if (!unit) {
      throw new NotFoundError(`Unit with ID ${id} not found`);
    }
    await this.productRepository.deleteUnit(id);
  }
}
