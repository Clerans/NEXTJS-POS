import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import bcrypt from 'bcryptjs';
import { POService } from '../service/po.service.js';
import { GRNService } from '../../grn/service/grn.service.js';
import { ReturnService } from '../../returns/service/returns.service.js';
import { WarehouseService } from '../../warehouse/service/warehouse.service.js';
import { pool, initDatabase } from '../../../config/db.js';
import { UnprocessableEntityError, ForbiddenError } from '../../../common/errors/app-error.js';

describe('Purchasing & Warehouse Engine', () => {
  let poService: POService;
  let grnService: GRNService;
  let returnService: ReturnService;
  let warehouseService: WarehouseService;

  beforeEach(async () => {
    await initDatabase();

    poService = new POService();
    grnService = new GRNService();
    returnService = new ReturnService();
    warehouseService = new WarehouseService();

    // Ensure manager PIN '1234' is hashed for user 1
    const hashedPin = await bcrypt.hash('1234', 10);
    await pool.query('UPDATE users SET pin_code_hash = $1 WHERE id = 1', [hashedPin]);

    // Ensure stock setup for warehouses
    await pool.query(
      `INSERT INTO raw_material_inventory (warehouse_id, raw_material_id, current_stock, reorder_level)
       VALUES (1, 1, 100.00, 10.00), (2, 1, 0.00, 10.00)
       ON CONFLICT (warehouse_id, raw_material_id) DO UPDATE SET current_stock = EXCLUDED.current_stock`
    );
  });

  it('should create low-value PO as APPROVED and high-value PO as PENDING_APPROVAL', async () => {
    const lowValuePO = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 10, unitCost: 500 }], // Total = 5,000
    });
    assert.strictEqual(lowValuePO.status, 'APPROVED');

    const highValuePO = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 500, unitCost: 1000 }], // Total = 500,000
    });
    assert.strictEqual(highValuePO.status, 'PENDING_APPROVAL');
  });

  it('should approve high-value PO with valid Manager PIN code', async () => {
    const highValuePO = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 200, unitCost: 1000 }],
    });

    await poService.approvePO({ poId: highValuePO.id, managerPin: '1234' }, 1);
    const updated = await poService.getPOById(highValuePO.id);
    assert.strictEqual(updated.status, 'APPROVED');
  });

  it('should reject PO approval when Manager PIN is invalid', async () => {
    const highValuePO = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 200, unitCost: 1000 }],
    });

    await assert.rejects(
      async () => {
        await poService.approvePO({ poId: highValuePO.id, managerPin: '9999' }, 1);
      },
      (err: any) => err instanceof ForbiddenError
    );
  });

  it('should process partial GRN receipt and update PO status to PARTIALLY_RECEIVED', async () => {
    const po = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 100, unitCost: 500 }],
    });

    // Receive 60 out of 100
    const grn = await grnService.createGRN({
      purchaseOrderId: po.id,
      supplierId: 1,
      branchId: 1,
      invoiceNumber: `INV-GRN-${Date.now()}`,
      items: [{ rawMaterialId: 1, receivedQuantity: 60, unitCost: 500, batchNumber: 'BATCH-PARTIAL-01' }],
    });

    assert.ok(grn);
    const updatedPO = await poService.getPOById(po.id);
    assert.strictEqual(updatedPO.status, 'PARTIALLY_RECEIVED');
  });

  it('should process second GRN to complete PO and update status to FULLY_RECEIVED', async () => {
    const po = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 100, unitCost: 500 }],
    });

    // GRN 1: 60
    await grnService.createGRN({
      purchaseOrderId: po.id,
      supplierId: 1,
      branchId: 1,
      invoiceNumber: `INV-GRN1-${Date.now()}`,
      items: [{ rawMaterialId: 1, receivedQuantity: 60, unitCost: 500 }],
    });

    // GRN 2: 40
    await grnService.createGRN({
      purchaseOrderId: po.id,
      supplierId: 1,
      branchId: 1,
      invoiceNumber: `INV-GRN2-${Date.now()}`,
      items: [{ rawMaterialId: 1, receivedQuantity: 40, unitCost: 500 }],
    });

    const updatedPO = await poService.getPOById(po.id);
    assert.strictEqual(updatedPO.status, 'FULLY_RECEIVED');
  });

  it('should reject over-receiving when received quantity exceeds remaining ordered quantity', async () => {
    const po = await poService.createPO({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 50, unitCost: 500 }],
    });

    await assert.rejects(
      async () => {
        await grnService.createGRN({
          purchaseOrderId: po.id,
          supplierId: 1,
          branchId: 1,
          invoiceNumber: `INV-OVER-${Date.now()}`,
          items: [{ rawMaterialId: 1, receivedQuantity: 120, unitCost: 500 }], // Exceeds 50
        });
      },
      (err: any) => err instanceof UnprocessableEntityError
    );
  });

  it('should process Supplier Return and reduce raw material stock transactionally', async () => {
    const ret = await returnService.processSupplierReturn({
      supplierId: 1,
      branchId: 1,
      items: [{ rawMaterialId: 1, quantity: 10.0, unitCost: 500, reason: 'Damaged packaging' }],
    });

    assert.ok(ret);
    assert.strictEqual(ret.status, 'APPROVED');
  });

  it('should execute warehouse stock transfer transactionally between two warehouses', async () => {
    const transfer = await warehouseService.createTransfer({
      sourceWarehouseId: 1,
      destinationWarehouseId: 2,
      items: [{ rawMaterialId: 1, quantity: 15.0 }],
    });

    assert.ok(transfer);
    assert.strictEqual(transfer.status, 'IN_TRANSIT');
  });
});
