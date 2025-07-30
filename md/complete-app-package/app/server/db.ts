import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from "@shared/schema";

// Optional: ensure environment variables are loaded (but index.ts should handle it)
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to add it to your .env?");
}

// Configuration compatible with PostgreSQL 12+ for AlmaLinux 9
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 15000, // 15 seconds 
  idleTimeoutMillis: 30000, // 30 seconds
  max: 5, // reduced for stability
  ssl: process.env.DATABASE_URL?.includes('neon') || process.env.DATABASE_URL?.includes('localhost') === false ? { 
    rejectUnauthorized: false,
  } : false,
  keepAlive: true,
  allowExitOnIdle: false, // Keep connections alive
  // PostgreSQL 12+ compatible settings
  statement_timeout: 20000, // 20 seconds statement timeout
  query_timeout: 20000, // 20 seconds query timeout
});

export const db = drizzle(pool, { schema });