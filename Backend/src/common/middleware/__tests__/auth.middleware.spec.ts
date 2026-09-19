import { describe, it } from 'node:test';
import assert from 'node:assert';
import { authorize, AuthenticatedRequest } from '../auth.middleware.js';
import { ForbiddenError, UnauthorizedError } from '../../errors/app-error.js';

describe('RBAC Auth Middleware Authorization', () => {
  it('should allow ADMINISTRATOR role to pass any authorize check', () => {
    const middleware = authorize(['ADMINISTRATOR']);
    const req: any = { user: { userId: 1, role: 'ADMINISTRATOR' } };
    const res: any = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
  });

  it('should allow MANAGER role for authorize([ADMINISTRATOR, MANAGER])', () => {
    const middleware = authorize(['ADMINISTRATOR', 'MANAGER']);
    const req: any = { user: { userId: 2, role: 'MANAGER' } };
    const res: any = {};
    let nextCalled = false;

    middleware(req, res, () => {
      nextCalled = true;
    });

    assert.strictEqual(nextCalled, true);
  });

  it('should throw ForbiddenError 403 when CASHIER calls authorize([ADMINISTRATOR, MANAGER])', () => {
    const middleware = authorize(['ADMINISTRATOR', 'MANAGER']);
    const req: any = { user: { userId: 3, role: 'CASHIER' } };
    const res: any = {};

    assert.throws(
      () => {
        middleware(req, res, () => {});
      },
      (err: any) => {
        assert.ok(err instanceof ForbiddenError);
        assert.strictEqual(err.statusCode, 403);
        assert.ok(err.message.includes('insufficient role permissions'));
        return true;
      }
    );
  });

  it('should throw ForbiddenError 403 when MANAGER calls authorize([ADMINISTRATOR]) (e.g. DELETE /products/:id)', () => {
    const middleware = authorize(['ADMINISTRATOR']);
    const req: any = { user: { userId: 2, role: 'MANAGER' } };
    const res: any = {};

    assert.throws(
      () => {
        middleware(req, res, () => {});
      },
      (err: any) => {
        assert.ok(err instanceof ForbiddenError);
        assert.strictEqual(err.statusCode, 403);
        return true;
      }
    );
  });

  it('should throw UnauthorizedError 401 when no user is attached to request', () => {
    const middleware = authorize(['ADMINISTRATOR', 'MANAGER']);
    const req: any = {};
    const res: any = {};

    assert.throws(
      () => {
        middleware(req, res, () => {});
      },
      (err: any) => {
        assert.ok(err instanceof UnauthorizedError);
        assert.strictEqual(err.statusCode, 401);
        return true;
      }
    );
  });
});
