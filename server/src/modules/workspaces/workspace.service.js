import { getDb, schema } from '../../db/index.js';
import { eq, and } from 'drizzle-orm';
import { ApiError } from '../../utils/api-error.js';
import { randomBytes } from 'crypto';

export class WorkspaceService {
  static slugify(text) {
    const base = text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return base || 'workspace';
  }

  static async listUserWorkspaces(userId) {
    const db = getDb();
    if (!db) {
      throw ApiError.database('Database connection unavailable.');
    }

    const memberships = await db
      .select({
        id: schema.workspaces.id,
        name: schema.workspaces.name,
        slug: schema.workspaces.slug,
        ownerUserId: schema.workspaces.ownerUserId,
        role: schema.workspaceMembers.role,
        createdAt: schema.workspaces.createdAt,
      })
      .from(schema.workspaceMembers)
      .innerJoin(
        schema.workspaces,
        eq(schema.workspaceMembers.workspaceId, schema.workspaces.id)
      )
      .where(eq(schema.workspaceMembers.userId, userId));

    return memberships;
  }

  static async getWorkspaceById(workspaceId, userId) {
    const db = getDb();
    if (!db) {
      throw ApiError.database('Database connection unavailable.');
    }

    const [record] = await db
      .select({
        id: schema.workspaces.id,
        name: schema.workspaces.name,
        slug: schema.workspaces.slug,
        ownerUserId: schema.workspaces.ownerUserId,
        role: schema.workspaceMembers.role,
        createdAt: schema.workspaces.createdAt,
      })
      .from(schema.workspaceMembers)
      .innerJoin(
        schema.workspaces,
        eq(schema.workspaceMembers.workspaceId, schema.workspaces.id)
      )
      .where(
        and(
          eq(schema.workspaceMembers.workspaceId, workspaceId),
          eq(schema.workspaceMembers.userId, userId)
        )
      )
      .limit(1);

    if (!record) {
      throw ApiError.forbidden('You do not have access to this workspace.');
    }

    return record;
  }

  /**
   * Idempotent workspace creation or retrieval.
   * If a user already has a workspace and requests init, returns their existing workspace.
   */
  static async createWorkspace(userId, { name, slug, idempotent = true }) {
    const db = getDb();
    if (!db) {
      throw ApiError.database('Database connection unavailable.');
    }

    // Check if user already owns a workspace when idempotent flag is set
    if (idempotent) {
      const existing = await this.listUserWorkspaces(userId);
      const owned = existing.find((w) => w.ownerUserId === userId || w.role === 'owner');
      if (owned) {
        return owned;
      }
    }

    const workspaceName = (name && name.trim()) || 'My Workspace';
    let baseSlug = (slug && slug.trim()) ? this.slugify(slug) : this.slugify(workspaceName);

    // Ensure unique slug
    let finalSlug = baseSlug;
    let attempts = 0;
    while (attempts < 5) {
      const [existingSlug] = await db
        .select({ id: schema.workspaces.id })
        .from(schema.workspaces)
        .where(eq(schema.workspaces.slug, finalSlug))
        .limit(1);

      if (!existingSlug) {
        break;
      }
      finalSlug = `${baseSlug}-${randomBytes(2).toString('hex')}`;
      attempts++;
    }

    // Insert workspace
    const [createdWorkspace] = await db
      .insert(schema.workspaces)
      .values({
        name: workspaceName,
        slug: finalSlug,
        ownerUserId: userId,
      })
      .returning();

    // Assign owner in workspace_members
    await db.insert(schema.workspaceMembers).values({
      workspaceId: createdWorkspace.id,
      userId,
      role: 'owner',
    });

    // Initialize associated creator_profile
    await db.insert(schema.creatorProfiles).values({
      workspaceId: createdWorkspace.id,
      displayName: workspaceName,
      onboardingCompleted: false,
    });

    return {
      ...createdWorkspace,
      role: 'owner',
    };
  }

  static async updateWorkspace(workspaceId, data) {
    const db = getDb();
    if (!db) {
      throw ApiError.database('Database connection unavailable.');
    }

    const updateFields = { updatedAt: new Date() };
    if (data.name) updateFields.name = data.name;

    const [updated] = await db
      .update(schema.workspaces)
      .set(updateFields)
      .where(eq(schema.workspaces.id, workspaceId))
      .returning();

    return updated;
  }

  static async listMembers(workspaceId) {
    const db = getDb();
    if (!db) {
      throw ApiError.database('Database connection unavailable.');
    }

    const members = await db
      .select({
        membershipId: schema.workspaceMembers.id,
        userId: schema.workspaceMembers.userId,
        role: schema.workspaceMembers.role,
        joinedAt: schema.workspaceMembers.createdAt,
        displayName: schema.users.displayName,
        avatarUrl: schema.users.avatarUrl,
      })
      .from(schema.workspaceMembers)
      .leftJoin(schema.users, eq(schema.workspaceMembers.userId, schema.users.id))
      .where(eq(schema.workspaceMembers.workspaceId, workspaceId));

    return members;
  }
}
