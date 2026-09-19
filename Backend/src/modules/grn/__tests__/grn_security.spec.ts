import { describe, it } from 'node:test';
import assert from 'node:assert';
import { authenticate, authorize, branchAccess, AuthenticatedRequest } from '../../../common/middleware/auth.middleware.js';
import { UnauthorizedError, ForbiddenError } from '../../../common/errors/app-error.js';
import { GRNController } from '../controller/grn.controller.js';

describe('GRN Route Security & Access Control', () => {
  const grnController = new GRNController();

  it('should reject unauthenticated requests to GRN routes with UnauthorizedError', () => {
    const req = { headers: {} } as any;
    const res = {} as any;
    const next = () => {};

    assert.throws(
      () => authenticate(req, res, next),
      (err: any) => err instanceof UnauthorizedError
    );
  });

  it('should reject CASHIER role attempting to view or create GRN with ForbiddenError', () => {
    const req = {
      user: { userId: 5, username: 'cashier_user', role: 'CASHIER', branchIds: [1] },
    } as unknown as AuthenticatedRequest;
    const res = {} as any;
    const next = () => {};

    const rbacMiddleware = authorize(['ADMINISTRATOR', 'MANAGER', 'WAREHOUSE']);
    assert.throws(
      () => rbacMiddleware(req, res, next),
      (err: any) => err instanceof ForbiddenError
    );
  });

  it('should allow WAREHOUSE role past GRN authorization check', () => {
    const req = {
      user: { userId: 6, username: 'warehouse_officer', role: 'WAREHOUSE', branchIds: [1] },
    } as unknown as AuthenticatedRequest;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const rbacMiddleware = authorize(['ADMINISTRATOR', 'MANAGER', 'WAREHOUSE']);
    rbacMiddleware(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  it('should allow MANAGER role past GRN authorization check', () => {
    const req = {
      user: { userId: 7, username: 'store_manager', role: 'MANAGER', branchIds: [1] },
    } as unknown as AuthenticatedRequest;
    const res = {} as any;
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    const rbacMiddleware = authorize(['ADMINISTRATOR', 'MANAGER', 'WAREHOUSE']);
    rbacMiddleware(req, res, next);
    assert.strictEqual(nextCalled, true);
  });

  it('should reject WAREHOUSE role from recording GRN payments (payment requires MANAGER or ADMIN)', () => {
    const req = {
      user: { userId: 6, username: 'warehouse_officer', role: 'WAREHOUSE', branchIds: [1] },
    } as unknown as AuthenticatedRequest;
    const res = {} as any;
    const next = () => {};

    const paymentRbac = authorize(['ADMINISTRATOR', 'MANAGER']);
    assert.throws(
      () => paymentRbac(req, res, next),
      (err: any) => err instanceof ForbiddenError
    );
  });

  it('should block cross-branch GRN access when user attempts to access unauthorized branch', () => {
    const req = {
      user: { userId: 8, username: 'branch2_manager', role: 'MANAGER', branchIds: [2] },
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
});
