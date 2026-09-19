import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export function createRateLimiter(maxRequests: number, windowMs: number, customMessage?: string) {
  const store = new Map<string, RateLimitRecord>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();
    const record = store.get(ip);

    if (!record || now > record.resetTime) {
      store.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        success: false,
        message: customMessage || 'Too many requests, please try again later.',
      });
      return;
    }

    record.count += 1;
    next();
  };
}

export const authRateLimiter = createRateLimiter(
  10,
  15 * 60 * 1000,
  'Too many authentication attempts. Please try again after 15 minutes.'
);

export const posVoidRateLimiter = createRateLimiter(
  15,
  15 * 60 * 1000,
  'Too many order void attempts. Please try again after 15 minutes.'
);

export const globalApiRateLimiter = createRateLimiter(
  300,
  15 * 60 * 1000,
  'Too many requests, please try again later.'
);
