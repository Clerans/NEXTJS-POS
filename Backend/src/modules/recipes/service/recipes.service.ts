import { RecipeRepository } from '../repository/recipes.repository.js';
import { CreateRecipeDto, UpdateRecipeDto, RecipeResponseDto } from '../dto/recipes.dto.js';
import { ConflictError, NotFoundError } from '../../../common/errors/app-error.js';
import { pool } from '../../../config/db.js';

export class RecipeService {
  private repository: RecipeRepository;

  constructor() {
    this.repository = new RecipeRepository();
  }

  async getAllRecipes(): Promise<RecipeResponseDto[]> {
    return await this.repository.findAll();
  }

  async getRecipeById(id: number): Promise<RecipeResponseDto> {
    const recipe = await this.repository.findById(id);
    if (!recipe) {
      throw new NotFoundError(`Recipe with ID ${id} not found`);
    }
    return recipe;
  }

  async getRecipeByProductId(productId: number): Promise<RecipeResponseDto> {
    const recipe = await this.repository.findByProductId(productId);
    if (!recipe) {
      throw new NotFoundError(`Recipe for Product ID ${productId} not found`);
    }
    return recipe;
  }

  async createRecipe(dto: CreateRecipeDto): Promise<RecipeResponseDto> {
    const productCheck = await pool.query(`SELECT id FROM products WHERE id = $1`, [dto.productId]);
    if (productCheck.rows.length === 0) {
      throw new NotFoundError(`Product with ID ${dto.productId} not found`);
    }

    const existing = await this.repository.findByProductId(dto.productId);
    if (existing) {
      throw new ConflictError(`Recipe for Product ID ${dto.productId} already exists`);
    }

    return await this.repository.create(dto);
  }

  async updateRecipe(id: number, dto: UpdateRecipeDto): Promise<RecipeResponseDto> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Recipe with ID ${id} not found`);
    }

    if (dto.productId && dto.productId !== existing.productId) {
      const productCheck = await pool.query(`SELECT id FROM products WHERE id = $1`, [dto.productId]);
      if (productCheck.rows.length === 0) {
        throw new NotFoundError(`Product with ID ${dto.productId} not found`);
      }

      const conflict = await this.repository.findByProductId(dto.productId);
      if (conflict) {
        throw new ConflictError(`Recipe for Product ID ${dto.productId} already exists`);
      }
    }

    const updated = await this.repository.update(id, dto);
    if (!updated) {
      throw new NotFoundError(`Recipe with ID ${id} not found`);
    }
    return updated;
  }

  async deleteRecipe(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Recipe with ID ${id} not found`);
    }

    await this.repository.delete(id);
  }
}
