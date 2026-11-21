import { Router } from 'express';
import { WorkspaceController } from './workspace.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireWorkspaceMember } from '../../middleware/workspace.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { z } from 'zod';

const router = Router();

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(150),
  slug: z.string().min(1).max(100).optional(),
  idempotent: z.boolean().optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(1).max(150),
});

const workspaceIdParamSchema = z.object({
  workspaceId: z.string().uuid(),
});

router.use(requireAuth);

router.get('/', asyncHandler(WorkspaceController.list));
router.post('/', validateRequest({ body: createWorkspaceSchema }), asyncHandler(WorkspaceController.create));

router.get(
  '/:workspaceId',
  validateRequest({ params: workspaceIdParamSchema }),
  requireWorkspaceMember(),
  asyncHandler(WorkspaceController.getById)
);

router.patch(
  '/:workspaceId',
  validateRequest({ params: workspaceIdParamSchema, body: updateWorkspaceSchema }),
  requireWorkspaceMember(['owner', 'admin']),
  asyncHandler(WorkspaceController.update)
);

router.get(
  '/:workspaceId/members',
  validateRequest({ params: workspaceIdParamSchema }),
  requireWorkspaceMember(),
  asyncHandler(WorkspaceController.listMembers)
);

export default router;
