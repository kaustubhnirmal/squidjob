import dotenv from 'dotenv';
dotenv.config();
import pg from 'pg';
const { Pool } = pg;

import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Local PostgreSQL configuration for AlmaLinux 9 with PostgreSQL 12/13
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to add it to your .env?");
}

// Configuration optimized for AlmaLinux 9 and PostgreSQL 12/13
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 20000, // 20 seconds - longer timeout for local connections
  idleTimeoutMillis: 60000, // 60 seconds - longer idle for local
  max: 10, // Higher pool size for local server
  ssl: false, // No SSL for local PostgreSQL
  keepAlive: true,
  allowExitOnIdle: false,
  // PostgreSQL 12+ compatible settings
  statement_timeout: 30000, // 30 seconds statement timeout
  query_timeout: 30000, // 30 seconds query timeout
  // Additional connection options for stability
  application_name: 'Tender247',
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

pool.on('connect', (client) => {
  console.log('New client connected to PostgreSQL');
});

export const db = drizzle(pool, { schema });

// Export a function to test database connection
export async function testConnection() {
  try {
    const result = await db.execute("SELECT version(), current_database(), current_user");
    console.log('Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database pool...');
  await pool.end();
  process.exit(0);
});