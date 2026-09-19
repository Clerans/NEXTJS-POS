import { Request, Response, NextFunction } from 'express';
import { RecipeService } from '../service/recipes.service.js';
import { createRecipeSchema, updateRecipeSchema } from '../validator/recipes.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class RecipeController {
  private service: RecipeService;

  constructor() {
    this.service = new RecipeService();
  }

  getRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipes = await this.service.getAllRecipes();
      res.status(200).json(ApiResponse.success(recipes, 'Recipes list retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getRecipeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const recipe = await this.service.getRecipeById(id);
      res.status(200).json(ApiResponse.success(recipe, 'Recipe details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getRecipeByProductId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const productId = parseInt(req.params.productId, 10);
      const recipe = await this.service.getRecipeByProductId(productId);
      res.status(200).json(ApiResponse.success(recipe, 'Product recipe retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createRecipeSchema.parse(req.body);
      const recipe = await this.service.createRecipe(validatedData);
      res.status(201).json(ApiResponse.success(recipe, 'Recipe created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateRecipeSchema.parse(req.body);
      const recipe = await this.service.updateRecipe(id, validatedData);
      res.status(200).json(ApiResponse.success(recipe, 'Recipe updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.service.deleteRecipe(id);
      res.status(200).json(ApiResponse.success(null, 'Recipe deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
