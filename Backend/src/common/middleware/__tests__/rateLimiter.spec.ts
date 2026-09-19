import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createRateLimiter } from '../rateLimiter.js';

describe('Tiered Rate Limiter Middleware', () => {
  it('should allow requests within limit and block when maxRequests limit is exceeded', () => {
    const limiter = createRateLimiter(3, 60000, 'Custom limit exceeded');

    const req: any = { ip: '192.168.1.100', socket: {} };
    let resStatus = 0;
    let resHeader = '';
    let resBody: any = null;

    const res: any = {
      setHeader: (key: string, value: string) => {
        if (key === 'Retry-After') resHeader = value;
      },
      status: (code: number) => {
        resStatus = code;
        return {
          json: (data: any) => {
            resBody = data;
          },
        };
      },
    };

    let nextCount = 0;
    const next = () => {
      nextCount++;
    };

    // Requests 1, 2, 3 should pass
    limiter(req, res, next);
    limiter(req, res, next);
    limiter(req, res, next);

    assert.strictEqual(nextCount, 3);
    assert.strictEqual(resStatus, 0);

    // Request 4 should be rate-limited (HTTP 429)
    limiter(req, res, next);

    assert.strictEqual(nextCount, 3); // next not called
    assert.strictEqual(resStatus, 429);
    assert.ok(resHeader);
    assert.strictEqual(resBody.success, false);
    assert.strictEqual(resBody.message, 'Custom limit exceeded');
  });
});
