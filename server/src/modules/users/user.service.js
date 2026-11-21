import { getDb, schema } from '../../db/index.js';
import { eq } from 'drizzle-orm';
import { ApiError } from '../../utils/api-error.js';

export class UserService {
  static async getCurrentUser(userId, fallbackData = {}) {
    const db = getDb();
    if (!db) {
      return {
        id: userId,
        displayName: fallbackData.displayName || 'Creator',
        avatarUrl: fallbackData.avatarUrl || null,
        createdAt: new Date().toISOString(),
      };
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    if (!user) {
      // Auto-provision user if missing
      const [created] = await db
        .insert(schema.users)
        .values({
          id: userId,
          displayName: fallbackData.displayName || 'Creator',
          avatarUrl: fallbackData.avatarUrl || null,
        })
        .returning();
      return created;
    }

    return user;
  }

  static async updateUser(userId, data) {
    const db = getDb();
    if (!db) {
      throw ApiError.database('Database connection unavailable.');
    }

    const updateFields = {
      updatedAt: new Date(),
    };
    if (data.displayName !== undefined) updateFields.displayName = data.displayName;
    if (data.avatarUrl !== undefined) updateFields.avatarUrl = data.avatarUrl;

    const [updated] = await db
      .update(schema.users)
      .set(updateFields)
      .where(eq(schema.users.id, userId))
      .returning();

    if (!updated) {
      throw ApiError.notFound('User profile not found.');
    }

    return updated;
  }
}
