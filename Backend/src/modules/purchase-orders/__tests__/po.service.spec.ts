import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { POService } from '../service/po.service.js';
import { UnprocessableEntityError } from '../../../common/errors/app-error.js';

describe('POService', () => {
  let poService: POService;

  beforeEach(() => {
    poService = new POService();
  });

  it('should auto-approve low-value purchase orders below threshold', async () => {
    const po = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [
        { rawMaterialId: 1, quantity: 5, unitCost: 1000 }, // Total = 5,000 < 100,000
      ],
    });

    assert.ok(po);
    assert.strictEqual(po.totalAmount, 5000);
    assert.strictEqual(po.status, 'APPROVED');
  });

  it('should set status to PENDING_APPROVAL for high-value purchase orders', async () => {
    const po = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [
        { rawMaterialId: 1, quantity: 20, unitCost: 10000 }, // Total = 200,000 > 100,000
      ],
    });

    assert.ok(po);
    assert.strictEqual(po.totalAmount, 200000);
    assert.strictEqual(po.status, 'PENDING_APPROVAL');
  });

  it('should allow approving a PENDING_APPROVAL purchase order', async () => {
    const po = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 25, unitCost: 10000 }], // 250,000
    });

    assert.strictEqual(po.status, 'PENDING_APPROVAL');

    const updated = await poService.updatePOStatus(po.id, 'APPROVED');
    assert.strictEqual(updated.status, 'APPROVED');
  });

  it('should allow rejecting a PENDING_APPROVAL purchase order', async () => {
    const po = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 30, unitCost: 10000 }], // 300,000
    });

    assert.strictEqual(po.status, 'PENDING_APPROVAL');

    const updated = await poService.updatePOStatus(po.id, 'REJECTED');
    assert.strictEqual(updated.status, 'REJECTED');
  });

  it('should prevent changing status of a terminal purchase order', async () => {
    const po = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 30, unitCost: 10000 }],
    });

    await poService.updatePOStatus(po.id, 'REJECTED');

    await assert.rejects(
      async () => {
        await poService.updatePOStatus(po.id, 'APPROVED');
      },
      (err: any) => err instanceof UnprocessableEntityError
    );
  });
});
