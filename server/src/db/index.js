import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';
import { config } from '../config/index.js';
import { logger } from '../utils/logger.js';

let client = null;
let db = null;

export function getDb(customUrl) {
  if (db && !customUrl) return db;

  const connectionString = customUrl || config.DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    logger.warn('DATABASE_URL is not configured. Database operations will require active configuration.');
    return null;
  }

  try {
    client = postgres(connectionString, {
      max: 10,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    const instance = drizzle(client, { schema });
    if (!customUrl) {
      db = instance;
    }
    return instance;
  } catch (err) {
    logger.error({ err }, 'Failed to initialize database connection');
    throw err;
  }
}

export async function closeDb() {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}

export { schema };
