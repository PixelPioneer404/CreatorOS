import { ApiError } from '../utils/api-error.js';
import { getDb, schema } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const uuidSchema = z.string().uuid();

export function requireWorkspaceMember(allowedRoles = []) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw ApiError.unauthenticated();
      }

      const workspaceId = req.params.workspaceId || req.headers['x-workspace-id'] || req.body?.workspaceId;

      if (!workspaceId) {
        throw ApiError.badRequest('Workspace ID is required.');
      }

      const parseResult = uuidSchema.safeParse(workspaceId);
      if (!parseResult.success) {
        throw ApiError.badRequest('Invalid workspace ID format.');
      }

      const db = getDb();
      if (!db) {
        throw ApiError.database('Database connection unavailable.');
      }

      const [membership] = await db
        .select()
        .from(schema.workspaceMembers)
        .where(
          and(
            eq(schema.workspaceMembers.workspaceId, workspaceId),
            eq(schema.workspaceMembers.userId, req.user.id)
          )
        )
        .limit(1);

      if (!membership) {
        throw ApiError.forbidden('You do not have access to this workspace.');
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(membership.role)) {
        throw ApiError.forbidden('Your workspace role is insufficient for this operation.');
      }

      req.workspace = {
        id: membership.workspaceId,
        role: membership.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}
