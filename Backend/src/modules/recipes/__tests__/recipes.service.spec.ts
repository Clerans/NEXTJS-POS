import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { RecipeService } from '../service/recipes.service.js';

describe('RecipeService', () => {
  let service: RecipeService;

  beforeEach(() => {
    service = new RecipeService();
  });

  it('should retrieve list of recipes cleanly', async () => {
    const list = await service.getAllRecipes();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 1);
  });

  it('should retrieve recipe by product ID cleanly', async () => {
    const recipe = await service.getRecipeByProductId(1);
    assert.ok(recipe);
    assert.strictEqual(recipe.productId, 1);
    assert.ok(Array.isArray(recipe.items));
  });

  it('should throw NotFoundError for non-existent recipe ID', async () => {
    try {
      await service.getRecipeById(999999);
      assert.fail('Should have thrown NotFoundError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 404);
    }
  });

  it('should throw ConflictError when creating duplicate recipe for same product', async () => {
    try {
      await service.createRecipe({
        productId: 1,
        name: 'Duplicate Recipe',
        items: [{ rawMaterialId: 1, quantity: 0.02 }],
      });
      assert.fail('Should have thrown ConflictError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 409);
    }
  });
});
