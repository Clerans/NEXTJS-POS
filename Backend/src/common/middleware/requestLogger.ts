import { Request, Response, NextFunction } from 'express';

// Sanitized structured logger for production observability and request correlation
export const requestCorrelationMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const incomingId = req.headers['x-request-id'] as string;
  const requestId = incomingId || `req-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  
  // Attach to request and response header
  (req as any).id = requestId;
  res.setHeader('X-Request-Id', requestId);

  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Do not log health probes in standard logs to avoid clutter
    if (req.originalUrl?.includes('/health') || req.originalUrl?.includes('/liveness') || req.originalUrl?.includes('/readiness')) {
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: statusCode,
      durationMs,
      ip: req.ip || req.socket.remoteAddress,
      userId: (req as any).user?.id || undefined,
      branchId: (req as any).branchId || (req as any).user?.branchId || undefined,
    };

    if (statusCode >= 500) {
      console.error(JSON.stringify({ level: 'ERROR', ...logEntry }));
    } else if (statusCode >= 400) {
      console.warn(JSON.stringify({ level: 'WARN', ...logEntry }));
    } else if (process.env.NODE_ENV !== 'test') {
      console.log(JSON.stringify({ level: 'INFO', ...logEntry }));
    }
  });

  next();
};
