import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations(dbUrl) {
  const url = dbUrl || process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not defined.');
    return false;
  }
  const sql = postgres(url, { max: 1 });
  const db = drizzle(sql);
  try {
    console.log(`Running database migrations on ${url.split('@').pop()}...`);
    await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
    console.log('Migrations completed successfully.');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
