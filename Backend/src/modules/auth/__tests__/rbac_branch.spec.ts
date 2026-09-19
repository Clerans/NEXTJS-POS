import { describe, it } from 'node:test';
import assert from 'node:assert';
import { authorize, requirePermission, branchAccess, AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';
import { UnauthorizedError, ForbiddenError } from '../../../common/errors/app-error.js';

describe('RBAC & Branch Security Middleware', () => {
  it('should allow ADMINISTRATOR role past authorize middleware', () => {
    const req = { user: { userId: 1, username: 'admin', role: 'ADMINISTRATOR', permissions: [] } } as unknown as AuthenticatedRequest;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const middleware = authorize(['CASHIER']);
    middleware(req, res, next);

    assert.strictEqual(nextCalled, true);
  });

  it('should reject user with wrong role with ForbiddenError', () => {
    const req = { user: { userId: 2, username: 'cashier1', role: 'CASHIER', permissions: ['POS_CREATE'] } } as unknown as AuthenticatedRequest;
    const res = {} as any;
    const next = () => {};

    const middleware = authorize(['MANAGER', 'ADMINISTRATOR']);
    assert.throws(
      () => middleware(req, res, next),
      (err: any) => err instanceof ForbiddenError
    );
  });

  it('should enforce granular permissions via requirePermission middleware', () => {
    const req = { user: { userId: 2, username: 'cashier1', role: 'CASHIER', permissions: ['POS_CREATE'] } } as unknown as AuthenticatedRequest;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const middleware = requirePermission('POS_CREATE');
    middleware(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  it('should reject user lacking required permission', () => {
    const req = { user: { userId: 2, username: 'cashier1', role: 'CASHIER', permissions: ['POS_CREATE'] } } as unknown as AuthenticatedRequest;
    const res = {} as any;
    const next = () => {};

    const middleware = requirePermission('USER_DELETE');
    assert.throws(
      () => middleware(req, res, next),
      (err: any) => err instanceof ForbiddenError
    );
  });

  it('should allow ADMINISTRATOR to access any branch', () => {
    const req = {
      user: { userId: 1, username: 'admin', role: 'ADMINISTRATOR', branchIds: [1] },
      params: { branchId: '2' },
      query: {},
      headers: {},
    } as any;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    branchAccess(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  it('should allow user accessing authorized branch', () => {
    const req = {
      user: { userId: 3, username: 'manager_kandy', role: 'MANAGER', branchIds: [2, 3] },
      params: { branchId: '2' },
      query: {},
      headers: {},
    } as any;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    branchAccess(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  it('should block user attempting cross-branch access to unauthorized branch', () => {
    const req = {
      user: { userId: 3, username: 'manager_kandy', role: 'MANAGER', branchIds: [3] },
      params: { branchId: '1' },
      query: {},
      headers: {},
    } as any;
    const res = {} as any;
    const next = () => {};

    assert.throws(
      () => branchAccess(req, res, next),
      (err: any) => err instanceof ForbiddenError
    );
  });

  it('should deny access when user has no assigned branches', () => {
    const req = {
      user: { userId: 4, username: 'new_staff', role: 'CASHIER', branchIds: [] },
      params: { branchId: '1' },
      query: {},
      headers: {},
    } as any;
    const res = {} as any;
    const next = () => {};

    assert.throws(
      () => branchAccess(req, res, next),
      (err: any) => err instanceof ForbiddenError && err.message.includes('has no assigned branches')
    );
  });
});
