import { Router } from 'express';
import { ProductController } from '../controller/products.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new ProductController();

// Auth & RBAC Protection
router.use(authenticate);

// --- CATEGORIES ROUTES ---
router.get('/categories', controller.getCategories);
router.get('/categories/:id', controller.getCategoryById);
router.post('/categories', authorize(['ADMINISTRATOR', 'MANAGER']), controller.createCategory);
router.put('/categories/:id', authorize(['ADMINISTRATOR', 'MANAGER']), controller.updateCategory);
router.delete('/categories/:id', authorize(['ADMINISTRATOR']), controller.deleteCategory);

// --- UNITS ROUTES ---
router.get('/units', controller.getUnits);
router.get('/units/:id', controller.getUnitById);
router.post('/units', authorize(['ADMINISTRATOR', 'MANAGER']), controller.createUnit);
router.put('/units/:id', authorize(['ADMINISTRATOR', 'MANAGER']), controller.updateUnit);
router.delete('/units/:id', authorize(['ADMINISTRATOR']), controller.deleteUnit);

// --- PRODUCTS ROUTES ---
router.get('/', controller.getProducts);
router.get('/:id', controller.getProductById);
router.post('/', authorize(['ADMINISTRATOR', 'MANAGER']), controller.createProduct);
router.put('/:id', authorize(['ADMINISTRATOR', 'MANAGER']), controller.updateProduct);
router.delete('/:id', authorize(['ADMINISTRATOR']), controller.deleteProduct);

export default router;
