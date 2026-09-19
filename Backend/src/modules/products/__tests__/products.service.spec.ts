import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { ProductService } from '../service/products.service.js';

describe('ProductService', () => {
  let productService: ProductService;

  beforeEach(() => {
    productService = new ProductService();
  });

  it('should retrieve list of products cleanly', async () => {
    const products = await productService.getAllProducts();
    assert.ok(Array.isArray(products));
    assert.ok(products.length > 0);
    assert.strictEqual(products[0].sku, 'SKU-ESP-001');
  });

  it('should throw ConflictError on duplicate SKU creation', async () => {
    try {
      await productService.createProduct({
        name: 'Duplicate Espresso',
        sku: 'SKU-ESP-001',
        categoryId: 1,
        unitId: 1,
        retailPrice: 450,
        costPrice: 120,
      });
      assert.fail('Should have thrown ConflictError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 409);
    }
  });

  it('should retrieve list of categories cleanly with product counts', async () => {
    const categories = await productService.getAllCategories();
    assert.ok(Array.isArray(categories));
    assert.ok(categories.length > 0);
    assert.ok(categories[0].count);
    assert.strictEqual(typeof categories[0].productCount, 'number');
  });

  it('should throw ConflictError on duplicate Category name creation', async () => {
    const categoryName = 'TestCat_' + Date.now();
    await productService.createCategory({ name: categoryName, status: 'Active' });
    try {
      await productService.createCategory({
        name: categoryName,
        status: 'Active',
      });
      assert.fail('Should have thrown ConflictError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 409);
    }
  });

  it('should retrieve list of units cleanly', async () => {
    const units = await productService.getAllUnits();
    assert.ok(Array.isArray(units));
    assert.ok(units.length > 0);
    assert.ok(units[0].abbr);
  });

  it('should throw ConflictError on duplicate Unit abbreviation creation', async () => {
    try {
      await productService.createUnit({
        name: 'Duplicate Pieces',
        abbr: 'pcs',
        type: 'Quantity',
      });
      assert.fail('Should have thrown ConflictError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 409);
    }
  });

  it('should update product details successfully', async () => {
    const updated = await productService.updateProduct(1, {
      retailPrice: 480,
    });
    assert.strictEqual(updated.id, 1);
    assert.strictEqual(Number(updated.retailPrice), 480);
  });
});
