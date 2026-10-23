import { Pool } from "pg";

// Ensure .env.local is loaded when running outside Next.js (e.g. CLI or scripts)
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Ignore if .env.local doesn't exist or is not readable
  }
}

/**
 * Checks if the database connection string is configured in the environment.
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.trim().length > 0);
}

// Global variable to maintain a single Pool instance across hot-reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

/**
 * Returns a singleton pg.Pool instance connected to DATABASE_URL.
 * Configured with SSL support for Supabase.
 */
export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  // Re-instantiate if pool does not exist or connection string has become available
  if (!global.__pgPool || (!global.__pgPool.options.connectionString && connectionString)) {
    global.__pgPool = new Pool({
      connectionString: connectionString || undefined,
      ssl:
        connectionString && !connectionString.includes("localhost")
          ? { rejectUnauthorized: false }
          : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  return global.__pgPool;
}

export const pool = getPool();
