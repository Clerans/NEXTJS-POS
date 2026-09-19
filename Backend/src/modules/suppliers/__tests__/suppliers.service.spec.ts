import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { SupplierService } from '../service/suppliers.service.js';

describe('SupplierService', () => {
  let supplierService: SupplierService;

  beforeEach(() => {
    supplierService = new SupplierService();
  });

  it('should retrieve list of registered suppliers cleanly', async () => {
    const list = await supplierService.getAllSuppliers();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 2);
  });

  it('should create new supplier cleanly', async () => {
    const code = `SUP-N-${Date.now().toString().slice(-4)}`;
    const newSupplier = await supplierService.createSupplier({
      code,
      name: 'Fresh Dairy Farm',
      phone: '+94 77 111 2222',
    });

    assert.ok(newSupplier);
    assert.strictEqual(newSupplier.code, code);
    assert.strictEqual(newSupplier.name, 'Fresh Dairy Farm');
  });

  it('should throw ConflictError when registering duplicate supplier code', async () => {
    try {
      await supplierService.createSupplier({
        code: 'SUP-001',
        name: 'Duplicate Vendor',
        phone: '+94 77 999 0000',
      });
      assert.fail('Should have thrown ConflictError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 409);
    }
  });
});
