import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { InventoryService } from '../service/inventory.service.js';
import { InventoryController } from '../controller/inventory.controller.js';
import { ForbiddenError } from '../../../common/errors/app-error.js';

describe('InventoryService & Branch Isolation Security', () => {
  let inventoryService: InventoryService;
  let inventoryController: InventoryController;

  beforeEach(() => {
    inventoryService = new InventoryService();
    inventoryController = new InventoryController();
  });

  it('should retrieve stock level balances for authorized branch', async () => {
    const stock = await inventoryService.getStockLevels(1);
    assert.ok(Array.isArray(stock));
    assert.ok(stock.length > 0);
  });

  it('should reject non-admin user querying another branch inventory with 403 Forbidden', async () => {
    const req: any = {
      user: { userId: 2, username: 'cashier1', role: 'CASHIER', branchId: 1, branchIds: [1] },
      query: { branchId: '2' }, // Attempting to query Branch #2
    };
    const res: any = {};
    const next = (err: any) => {
      assert.ok(err instanceof ForbiddenError);
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('Branch ID 2'));
    };

    await inventoryController.getStockLevels(req, res, next);
  });

  it('should allow administrator querying any branch inventory', async () => {
    const req: any = {
      user: { userId: 1, username: 'admin', role: 'ADMINISTRATOR', branchId: 1, branchIds: [1, 2] },
      query: { branchId: '2' },
    };
    let jsonResult: any = null;
    const res: any = {
      status: (code: number) => {
        assert.strictEqual(code, 200);
        return {
          json: (data: any) => {
            jsonResult = data;
          },
        };
      },
    };
    const next = (err: any) => {
      if (err) assert.fail(`Should not have thrown error: ${err.message}`);
    };

    await inventoryController.getStockLevels(req, res, next);
    assert.ok(jsonResult);
    assert.ok(jsonResult.success);
  });

  it('should reject non-admin adjusting inventory for another branch with 403 Forbidden', async () => {
    const req: any = {
      user: { userId: 2, username: 'cashier1', role: 'CASHIER', branchId: 1, branchIds: [1] },
      body: {
        branchId: 2, // Non-admin user assigned to branch 1 trying to adjust branch 2
        productId: 1,
        transactionType: 'ADJUSTMENT',
        quantityChange: 10,
        unitCost: 100,
        referenceId: 'REF-CROSS-BRANCH',
      },
    };
    const res: any = {};
    const next = (err: any) => {
      assert.ok(err instanceof ForbiddenError);
      assert.strictEqual(err.statusCode, 403);
      assert.ok(err.message.includes('Cannot adjust inventory for Branch ID 2'));
    };

    await inventoryController.adjustStock(req, res, next);
  });

  it('should throw UnprocessableEntityError when reducing stock below zero', async () => {
    try {
      await inventoryService.adjustStock(
        {
          branchId: 1,
          productId: 1,
          transactionType: 'SPOILAGE',
          quantityChange: -5000,
          unitCost: 120,
          referenceId: 'TEST-OVERDRAW',
        },
        1
      );
      assert.fail('Should have thrown UnprocessableEntityError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 422);
    }
  });

  it('should toggle product active status successfully', async () => {
    const isNowActive = await inventoryService.toggleProductStatus(1);
    assert.strictEqual(typeof isNowActive, 'boolean');
  });
});
