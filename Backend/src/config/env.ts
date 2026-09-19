import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const missingVars: string[] = [];
  if (!process.env.JWT_SECRET) missingVars.push('JWT_SECRET');
  if (!process.env.JWT_REFRESH_SECRET) missingVars.push('JWT_REFRESH_SECRET');
  if (!process.env.DB_NAME && !process.env.DATABASE_URL) missingVars.push('DB_NAME / DATABASE_URL');
  if (!process.env.ADMIN_INITIAL_PASSWORD) missingVars.push('ADMIN_INITIAL_PASSWORD');
  if (!process.env.ADMIN_INITIAL_PIN) missingVars.push('ADMIN_INITIAL_PIN');

  if (missingVars.length > 0) {
    console.error(`[FATAL] Production startup blocked due to missing environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction,
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || 'nexuspos_dev_jwt_secret_key_2026',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'nexuspos_dev_jwt_refresh_secret_key_2026',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'NEXUSPOS',
    connectionString: process.env.DATABASE_URL,
    poolMax: Number(process.env.DB_POOL_MAX) || 20,
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT) || 30000,
    connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT) || 5000,
  },
  adminInitialPassword: process.env.ADMIN_INITIAL_PASSWORD || 'password',
  adminInitialPin: process.env.ADMIN_INITIAL_PIN || '1234',
};
