import { describe, it } from 'node:test';
import assert from 'node:assert';
import { authenticate, authorize, branchAccess, AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';
import { UnauthorizedError, ForbiddenError } from '../../../common/errors/app-error.js';

describe('Reports Route Security & RBAC Isolation', () => {
  it('should reject unauthenticated access to reports endpoints with UnauthorizedError', () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = () => {};

    assert.throws(
      () => authenticate(req, res, next),
      (err: any) => err instanceof UnauthorizedError
    );
  });

  it('should reject CASHIER role attempting to view financial reports with ForbiddenError', () => {
    const req = {
      user: { userId: 10, username: 'cashier_user', role: 'CASHIER', branchIds: [1] },
    } as unknown as AuthenticatedRequest;
    const res = {} as any;
    const next = () => {};

    const reportsRbac = authorize(['ADMINISTRATOR', 'MANAGER']);
    assert.throws(
      () => reportsRbac(req, res, next),
      (err: any) => err instanceof ForbiddenError
    );
  });

  it('should allow MANAGER role to access financial reports', () => {
    const req = {
      user: { userId: 11, username: 'store_manager', role: 'MANAGER', branchIds: [1] },
    } as unknown as AuthenticatedRequest;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const reportsRbac = authorize(['ADMINISTRATOR', 'MANAGER']);
    reportsRbac(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  it('should allow ADMINISTRATOR role to access financial reports globally', () => {
    const req = {
      user: { userId: 1, username: 'admin', role: 'ADMINISTRATOR', branchIds: [1] },
    } as unknown as AuthenticatedRequest;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const reportsRbac = authorize(['ADMINISTRATOR', 'MANAGER']);
    reportsRbac(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  it('should deny manager attempting cross-branch report query for an unauthorized branch', () => {
    const req = {
      user: { userId: 11, username: 'branch1_manager', role: 'MANAGER', branchIds: [1] },
      query: { branchId: '2' },
      params: {},
      headers: {},
    } as any;
    const res = {} as any;
    const next = () => {};

    assert.throws(
      () => branchAccess(req, res, next),
      (err: any) => err instanceof ForbiddenError
    );
  });

  it('should allow manager requesting report for their authorized branch', () => {
    const req = {
      user: { userId: 11, username: 'branch1_manager', role: 'MANAGER', branchIds: [1] },
      query: { branchId: '1' },
      params: {},
      headers: {},
    } as any;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    branchAccess(req, res, next);
    assert.strictEqual(nextCalled, true);
  });
});
