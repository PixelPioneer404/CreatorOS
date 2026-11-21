import { getDb, schema } from '../../db/index.js';
import { eq } from 'drizzle-orm';
import { ApiError } from '../../utils/api-error.js';

export class CreatorService {
  static async getProfile(workspaceId) {
    const db = getDb();
    if (!db) {
      throw ApiError.database('Database connection unavailable.');
    }

    const [profile] = await db
      .select()
      .from(schema.creatorProfiles)
      .where(eq(schema.creatorProfiles.workspaceId, workspaceId))
      .limit(1);

    if (!profile) {
      throw ApiError.notFound('Creator profile not found for this workspace.');
    }

    return profile;
  }

  static async upsertProfile(workspaceId, data) {
    const db = getDb();
    if (!db) {
      throw ApiError.database('Database connection unavailable.');
    }

    const [existing] = await db
      .select({ id: schema.creatorProfiles.id })
      .from(schema.creatorProfiles)
      .where(eq(schema.creatorProfiles.workspaceId, workspaceId))
      .limit(1);

    const values = {
      workspaceId,
      displayName: data.displayName,
      username: data.username || null,
      bio: data.bio || null,
      primaryNiche: data.primaryNiche || null,
      secondaryNiches: data.secondaryNiches || [],
      primaryPlatform: data.primaryPlatform || null,
      otherPlatforms: data.otherPlatforms || [],
      goals: data.goals || [],
      targetAudience: data.targetAudience || null,
      experienceLevel: data.experienceLevel || null,
      preferredLanguage: data.preferredLanguage || null,
      country: data.country || null,
      timezone: data.timezone || null,
      onboardingCompleted: data.onboardingCompleted ?? false,
      updatedAt: new Date(),
    };

    if (existing) {
      const [updated] = await db
        .update(schema.creatorProfiles)
        .set(values)
        .where(eq(schema.creatorProfiles.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(schema.creatorProfiles)
        .values(values)
        .returning();
      return created;
    }
  }

  static async updateProfile(workspaceId, data) {
    const db = getDb();
    if (!db) {
      throw ApiError.database('Database connection unavailable.');
    }

    const [existing] = await db
      .select({ id: schema.creatorProfiles.id })
      .from(schema.creatorProfiles)
      .where(eq(schema.creatorProfiles.workspaceId, workspaceId))
      .limit(1);

    if (!existing) {
      throw ApiError.notFound('Creator profile not found.');
    }

    const updateFields = {
      updatedAt: new Date(),
    };

    const allowedKeys = [
      'displayName',
      'username',
      'bio',
      'primaryNiche',
      'secondaryNiches',
      'primaryPlatform',
      'otherPlatforms',
      'goals',
      'targetAudience',
      'experienceLevel',
      'preferredLanguage',
      'country',
      'timezone',
      'onboardingCompleted',
    ];

    for (const key of allowedKeys) {
      if (data[key] !== undefined) {
        updateFields[key] = data[key];
      }
    }

    const [updated] = await db
      .update(schema.creatorProfiles)
      .set(updateFields)
      .where(eq(schema.creatorProfiles.id, existing.id))
      .returning();

    return updated;
  }

  static async getDashboardSummary(workspaceId) {
    const db = getDb();
    if (!db) {
      throw ApiError.database('Database connection unavailable.');
    }

    const [workspace] = await db
      .select({
        id: schema.workspaces.id,
        name: schema.workspaces.name,
        slug: schema.workspaces.slug,
        createdAt: schema.workspaces.createdAt,
      })
      .from(schema.workspaces)
      .where(eq(schema.workspaces.id, workspaceId))
      .limit(1);

    const [creator] = await db
      .select()
      .from(schema.creatorProfiles)
      .where(eq(schema.creatorProfiles.workspaceId, workspaceId))
      .limit(1);

    return {
      workspace: workspace || { id: workspaceId, name: 'Creator Workspace' },
      creator: creator || {
        displayName: 'Creator',
        onboardingCompleted: false,
      },
      quickStats: {
        profileConfigured: Boolean(creator?.onboardingCompleted),
        primaryPlatform: creator?.primaryPlatform || 'Not connected',
        primaryNiche: creator?.primaryNiche || 'Not set',
      },
      // Real empty collections for upcoming modules - no fake data!
      recentIdeas: [],
      recentScripts: [],
      upcomingContent: [],
      recommendations: [],
    };
  }
}
