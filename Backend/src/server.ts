import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/routes/auth.routes.js';
import usersRoutes from './modules/users/routes/users.routes.js';
import productsRoutes from './modules/products/routes/products.routes.js';
import inventoryRoutes from './modules/inventory/routes/inventory.routes.js';
import posRoutes from './modules/pos/routes/pos.routes.js';
import poRoutes from './modules/purchase-orders/routes/po.routes.js';
import warehouseRoutes from './modules/warehouse/routes/warehouse.routes.js';
import hrRoutes from './modules/hr/routes/hr.routes.js';
import reportsRoutes from './modules/reports/routes/reports.routes.js';
import settingsRoutes from './modules/settings/routes/settings.routes.js';
import suppliersRoutes from './modules/suppliers/routes/suppliers.routes.js';
import customersRoutes from './modules/customers/routes/customers.routes.js';
import grnRoutes from './modules/grn/routes/grn.routes.js';
import promotionsRoutes from './modules/promotions/routes/promotions.routes.js';
import returnsRoutes from './modules/returns/routes/returns.routes.js';
import dashboardRoutes from './modules/dashboard/routes/dashboard.routes.js';
import branchesRoutes from './modules/branches/routes/branches.routes.js';
import rawMaterialsRoutes from './modules/raw-materials/routes/raw-materials.routes.js';
import recipesRoutes from './modules/recipes/routes/recipes.routes.js';
import tablesRoutes from './modules/tables/routes/tables.routes.js';
import vipRoomsRoutes from './modules/vip-rooms/routes/vip-rooms.routes.js';
import { errorHandler } from './common/middleware/error.middleware.js';
import { globalApiRateLimiter } from './common/middleware/rateLimiter.js';
import { requestCorrelationMiddleware } from './common/middleware/requestLogger.js';
import { pool, initDatabase } from './config/db.js';
import { config } from './config/env.js';

export const app = express();

// Security Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Request Body Size Limit, Request ID Correlation & CORS Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestCorrelationMiddleware);

// Liveness Probe Endpoint (Process Availability)
app.get('/api/v1/liveness', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', uptimeSeconds: process.uptime() });
});

// Health & Readiness Probe Endpoint (DB Reachability Verification)
const checkReadiness = async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      environment: config.env,
      modulesMounted: 15,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
};

app.get('/api/v1/health', checkReadiness);
app.get('/api/v1/readiness', checkReadiness);

// Global API Rate Limiter
app.use('/api/v1', globalApiRateLimiter);

// Domain API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/products', productsRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/pos', posRoutes);
app.use('/api/v1/purchase-orders', poRoutes);
app.use('/api/v1/purchasing/orders', poRoutes);
app.use('/api/v1/warehouse', warehouseRoutes);
app.use('/api/v1/hr', hrRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/suppliers', suppliersRoutes);
app.use('/api/v1/customers', customersRoutes);
app.use('/api/v1/grn', grnRoutes);
app.use('/api/v1/promotions', promotionsRoutes);
app.use('/api/v1/returns', returnsRoutes);
app.use('/api/v1/branches', branchesRoutes);
app.use('/api/v1/raw-materials', rawMaterialsRoutes);
app.use('/api/v1/recipes', recipesRoutes);
app.use('/api/v1/tables', tablesRoutes);
app.use('/api/v1/vip-rooms', vipRoomsRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

// Deterministic Server Bootstrap Procedure
export const bootstrap = async () => {
  try {
    // 1. Initialize DB and run migrations BEFORE starting HTTP listener
    await initDatabase();

    // 2. Start listening only after DB initialization succeeds
    const server = app.listen(config.port, () => {
      console.log(`[Server] NEXUSPOS Backend running on http://localhost:${config.port}`);
    });

    // 3. Graceful Shutdown Handlers
    const handleShutdown = async (signal: string) => {
      console.log(`[Server] Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        try {
          await pool.end();
          console.log('[PostgreSQL] Connection pool closed.');
          process.exit(0);
        } catch (err) {
          console.error('[PostgreSQL] Error closing connection pool:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    return server;
  } catch (error) {
    console.error('[FATAL] Backend Application Bootstrap Failed:', error);
    process.exit(1);
  }
};

// Execute bootstrap if file is main entry point
if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
