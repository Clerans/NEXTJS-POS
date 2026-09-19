import { Pool } from "pg";

const pgConnectionString = process.env.DATABASE_URL;

export const pgPool = pgConnectionString
  ? new Pool({
      connectionString: pgConnectionString,
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    })
  : null;
