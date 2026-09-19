import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { GRNService } from '../service/grn.service.js';
import { initDatabase } from '../../../config/db.js';

describe('GRNService', () => {
  let grnService: GRNService;

  beforeEach(async () => {
    await initDatabase();
    grnService = new GRNService();
  });

  it('should log new Goods Received Note (GRN) and calculate total amount correctly', async () => {
    const newGRN = await grnService.createGRN({
      supplierId: 1,
      branchId: 1,
      invoiceNumber: `TEST-INV-${Date.now()}-101`,
      items: [
        { rawMaterialId: 1, receivedQuantity: 10, unitCost: 1500 }, // 15,000
        { rawMaterialId: 2, receivedQuantity: 20, unitCost: 2000 }, // 40,000
      ],
    });

    assert.ok(newGRN);
    assert.strictEqual(newGRN.totalAmount, 55000);
    assert.strictEqual(newGRN.status, 'RECEIVED');
    assert.strictEqual(newGRN.paidAmount, 0.00);
    assert.strictEqual(newGRN.paymentStatus, 'UNPAID');
    assert.strictEqual(newGRN.dueBalance, 55000);
  });

  it('should retrieve existing GRN details cleanly', async () => {
    const created = await grnService.createGRN({
      supplierId: 1,
      branchId: 1,
      invoiceNumber: `TEST-INV-${Date.now()}-102`,
      items: [{ rawMaterialId: 1, receivedQuantity: 5, unitCost: 1000 }],
    });
    const grn = await grnService.getGRNById(created.id);
    assert.ok(grn);
    assert.strictEqual(grn.id, created.id);
  });

  it('should record partial and full payments against a GRN correctly', async () => {
    const grn = await grnService.createGRN({
      supplierId: 1,
      branchId: 1,
      invoiceNumber: `TEST-INV-${Date.now()}-103`,
      items: [{ rawMaterialId: 1, receivedQuantity: 10, unitCost: 1000 }], // Total 10,000
    });

    // 1. Partial payment of 4,000
    const partialRes = await grnService.recordPayment(grn.id, {
      amount: 4000,
      paymentMethod: 'CASH',
      referenceNo: 'REC-001',
    });

    assert.strictEqual(partialRes.paidAmount, 4000);
    assert.strictEqual(partialRes.dueBalance, 6000);
    assert.strictEqual(partialRes.paymentStatus, 'PARTIAL');

    // 2. Settlement payment of remaining 6,000
    const fullRes = await grnService.recordPayment(grn.id, {
      amount: 6000,
      paymentMethod: 'BANK_TRANSFER',
      referenceNo: 'REC-002',
    });

    assert.strictEqual(fullRes.paidAmount, 10000);
    assert.strictEqual(fullRes.dueBalance, 0);
    assert.strictEqual(fullRes.paymentStatus, 'PAID');
    assert.strictEqual(fullRes.status, 'PAID');
  });
});
