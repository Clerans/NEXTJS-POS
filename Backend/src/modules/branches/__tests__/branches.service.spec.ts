import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { BranchService } from '../service/branches.service.js';

describe('BranchService', () => {
  let branchService: BranchService;

  beforeEach(() => {
    branchService = new BranchService();
  });

  it('should retrieve list of registered branches cleanly', async () => {
    const list = await branchService.getAllBranches();
    assert.ok(Array.isArray(list));
    assert.ok(list.length >= 1);
  });

  it('should retrieve branch details by ID cleanly', async () => {
    const branch = await branchService.getBranchById(1);
    assert.ok(branch);
    assert.strictEqual(branch.id, 1);
  });

  it('should create new branch cleanly', async () => {
    const code = `BR-${Date.now().toString().slice(-5)}`;
    const newBranch = await branchService.createBranch({
      code,
      name: 'Test Branch Outlet',
      address: '123 Test Street',
      phone: '0112999999',
    });

    assert.ok(newBranch);
    assert.strictEqual(newBranch.code, code);
    assert.strictEqual(newBranch.name, 'Test Branch Outlet');
  });

  it('should throw ConflictError when registering duplicate branch code', async () => {
    try {
      await branchService.createBranch({
        code: 'MAIN',
        name: 'Duplicate Main Branch',
      });
      assert.fail('Should have thrown ConflictError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 409);
    }
  });

  it('should throw NotFoundError when accessing non-existent branch ID', async () => {
    try {
      await branchService.getBranchById(999999);
      assert.fail('Should have thrown NotFoundError');
    } catch (err: any) {
      assert.strictEqual(err.statusCode, 404);
    }
  });
});
