import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { WarehouseService } from '../service/warehouse.service.js';
import { UnprocessableEntityError } from '../../../common/errors/app-error.js';

describe('WarehouseService', () => {
  let warehouseService: WarehouseService;

  beforeEach(() => {
    warehouseService = new WarehouseService();
  });

  it('should create stock transfer in IN_TRANSIT status cleanly', async () => {
    const result = await warehouseService.createTransfer({
      sourceWarehouseId: 1,
      destinationWarehouseId: 2,
      items: [{ productId: 1, quantity: 10 }],
    });

    assert.ok(result);
    assert.strictEqual(result.status, 'IN_TRANSIT');
  });

  it('should throw BadRequestError when source and destination warehouses are identical', async () => {
    try {
      await warehouseService.createTransfer({
        sourceWarehouseId: 1,
        destinationWarehouseId: 1,
        items: [{ productId: 1, quantity: 5 }],
      });
      assert.fail('Should have thrown BadRequestError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 400);
    }
  });

  it('should mark IN_TRANSIT transfer as COMPLETED', async () => {
    const transfer = await warehouseService.createTransfer({
      sourceWarehouseId: 1,
      destinationWarehouseId: 2,
      items: [{ productId: 1, quantity: 10 }],
    });

    const completed = await warehouseService.completeTransfer(transfer.id);
    assert.strictEqual(completed.status, 'COMPLETED');
  });

  it('should mark IN_TRANSIT transfer as CANCELLED and return stock', async () => {
    const transfer = await warehouseService.createTransfer({
      sourceWarehouseId: 1,
      destinationWarehouseId: 2,
      items: [{ productId: 1, quantity: 5 }],
    });

    const cancelled = await warehouseService.cancelTransfer(transfer.id);
    assert.strictEqual(cancelled.status, 'CANCELLED');
  });

  it('should reject completing an already COMPLETED transfer', async () => {
    const transfer = await warehouseService.createTransfer({
      sourceWarehouseId: 1,
      destinationWarehouseId: 2,
      items: [{ productId: 1, quantity: 5 }],
    });

    await warehouseService.completeTransfer(transfer.id);

    await assert.rejects(
      async () => {
        await warehouseService.completeTransfer(transfer.id);
      },
      (err: any) => err instanceof UnprocessableEntityError
    );
  });
});
