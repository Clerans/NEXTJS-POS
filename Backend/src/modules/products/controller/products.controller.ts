import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../service/products.service.js';
import {
  createProductSchema,
  updateProductSchema,
  createCategorySchema,
  updateCategorySchema,
  createUnitSchema,
  updateUnitSchema,
} from '../validator/products.validator.js';
import { ApiResponse } from '../../../common/responses/api-response.js';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.productService.getAllProducts();
      res.status(200).json(ApiResponse.success(products, 'Product catalog retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await this.productService.getProductById(id);
      res.status(200).json(ApiResponse.success(product, 'Product details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const newProduct = await this.productService.createProduct(validatedData);
      res.status(201).json(ApiResponse.success(newProduct, 'Product created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateProductSchema.parse(req.body);
      const updatedProduct = await this.productService.updateProduct(id, validatedData);
      res.status(200).json(ApiResponse.success(updatedProduct, 'Product updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.productService.deleteProduct(id);
      res.status(200).json(ApiResponse.success(null, 'Product deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  // --- CATEGORY CONTROLLERS ---

  getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.productService.getAllCategories();
      res.status(200).json(ApiResponse.success(categories, 'Categories retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const category = await this.productService.getCategoryById(id);
      res.status(200).json(ApiResponse.success(category, 'Category details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createCategorySchema.parse(req.body);
      const newCategory = await this.productService.createCategory(validatedData);
      res.status(201).json(ApiResponse.success(newCategory, 'Category created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateCategorySchema.parse(req.body);
      const updatedCategory = await this.productService.updateCategory(id, validatedData);
      res.status(200).json(ApiResponse.success(updatedCategory, 'Category updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.productService.deleteCategory(id);
      res.status(200).json(ApiResponse.success(null, 'Category deleted successfully'));
    } catch (error) {
      next(error);
    }
  };

  // --- UNIT CONTROLLERS ---

  getUnits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const units = await this.productService.getAllUnits();
      res.status(200).json(ApiResponse.success(units, 'Units of measurement retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  getUnitById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const unit = await this.productService.getUnitById(id);
      res.status(200).json(ApiResponse.success(unit, 'Unit details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  };

  createUnit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createUnitSchema.parse(req.body);
      const newUnit = await this.productService.createUnit(validatedData);
      res.status(201).json(ApiResponse.success(newUnit, 'Unit created successfully', 201));
    } catch (error) {
      next(error);
    }
  };

  updateUnit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      const validatedData = updateUnitSchema.parse(req.body);
      const updatedUnit = await this.productService.updateUnit(id, validatedData);
      res.status(200).json(ApiResponse.success(updatedUnit, 'Unit updated successfully'));
    } catch (error) {
      next(error);
    }
  };

  deleteUnit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id, 10);
      await this.productService.deleteUnit(id);
      res.status(200).json(ApiResponse.success(null, 'Unit deleted successfully'));
    } catch (error) {
      next(error);
    }
  };
}
