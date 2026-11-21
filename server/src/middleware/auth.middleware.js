import { verifyAuthToken } from '../integrations/supabase.js';
import { ApiError } from '../utils/api-error.js';
import { getDb, schema } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthenticated('Authentication required. Missing Bearer token.');
    }

    const token = authHeader.split(' ')[1];
    const user = await verifyAuthToken(token);

    if (!user) {
      throw ApiError.unauthenticated('Invalid or expired session token.');
    }

    req.user = user;

    // Ensure user record exists in application database
    const db = getDb();
    if (db) {
      try {
        const [existing] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, user.id))
          .limit(1);

        if (!existing) {
          const defaultName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'Creator';
          await db.insert(schema.users).values({
            id: user.id,
            displayName: defaultName,
            avatarUrl: user.user_metadata?.avatar_url || null,
          }).onConflictDoNothing();
        }
      } catch (dbErr) {
        logger.error({ dbErr, userId: user.id }, 'Error synchronizing user record with database');
        // Do not crash if DB sync has minor race condition
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
