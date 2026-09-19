import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { RawMaterialService } from '../service/raw-materials.service.js';

describe('RawMaterialService', () => {
  let service: RawMaterialService;

  beforeEach(() => {
    service = new RawMaterialService();
  });

  it('should retrieve list of registered raw materials cleanly', async () => {
    const list = await service.getAllRawMaterials();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 1);
  });

  it('should retrieve raw material details by ID cleanly', async () => {
    const item = await service.getRawMaterialById(1);
    assert.ok(item);
    assert.strictEqual(item.id, 1);
  });

  it('should create new raw material item cleanly', async () => {
    const code = `RM-TEST-${Date.now().toString().slice(-4)}`;
    const newItem = await service.createRawMaterial({
      code,
      name: 'Organic Cocoa Powder (kg)',
      costPerUnit: 1800.0,
      reorderLevel: 5.0,
    });

    assert.ok(newItem);
    assert.strictEqual(newItem.code, code);
    assert.strictEqual(newItem.name, 'Organic Cocoa Powder (kg)');
    assert.strictEqual(newItem.costPerUnit, 1800.0);
  });

  it('should throw ConflictError when registering duplicate raw material code', async () => {
    try {
      await service.createRawMaterial({
        code: 'RM-COF-001',
        name: 'Duplicate Coffee Beans',
        costPerUnit: 3500.0,
      });
      assert.fail('Should have thrown ConflictError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 409);
    }
  });

  it('should throw NotFoundError when accessing non-existent raw material ID', async () => {
    try {
      await service.getRawMaterialById(999999);
      assert.fail('Should have thrown NotFoundError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 404);
    }
  });

  it('should retrieve raw material batches cleanly', async () => {
    const batches = await service.getBatches(1);
    assert.ok(Array.isArray(batches));
  });

  it('should retrieve raw material inventory levels cleanly', async () => {
    const inventory = await service.getInventory(1);
    assert.ok(Array.isArray(inventory));
  });

  it('should record new batch for valid raw material', async () => {
    const batchNum = `BATCH-TEST-${Date.now().toString().slice(-4)}`;
    const batch = await service.createBatch({
      rawMaterialId: 1,
      warehouseId: 1,
      batchNumber: batchNum,
      quantity: 25.0,
      unitCost: 3500.0,
    });

    assert.ok(batch);
    assert.strictEqual(batch.batchNumber, batchNum);
    assert.strictEqual(batch.quantity, 25.0);
  });

  it('should adjust stock level for valid raw material', async () => {
    const inventory = await service.adjustStock({
      rawMaterialId: 1,
      warehouseId: 1,
      newQuantity: 120.0,
      reason: 'Audit correction',
    });

    assert.ok(inventory);
    assert.strictEqual(inventory.currentStock, 120.0);
  });

  it('should throw NotFoundError when creating batch for invalid raw material', async () => {
    try {
      await service.createBatch({
        rawMaterialId: 999999,
        warehouseId: 1,
        batchNumber: 'INVALID',
        quantity: 10.0,
        unitCost: 100.0,
      });
      assert.fail('Should have thrown NotFoundError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 404);
    }
  });
});
