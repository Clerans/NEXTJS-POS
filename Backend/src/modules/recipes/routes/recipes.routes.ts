import { Router } from 'express';
import { RecipeController } from '../controller/recipes.controller.js';
import { authenticate, authorize } from '../../../common/middleware/auth.middleware.js';

const router = Router();
const controller = new RecipeController();

router.get('/', controller.getRecipes);
router.get('/product/:productId', controller.getRecipeByProductId);
router.get('/:id', controller.getRecipeById);
router.post(
  '/',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.createRecipe
);
router.put(
  '/:id',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.updateRecipe
);
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMINISTRATOR', 'MANAGER']),
  controller.deleteRecipe
);

export default router;
