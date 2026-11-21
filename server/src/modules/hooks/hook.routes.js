import { Router } from 'express';
import { HookController } from './hook.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireWorkspaceMember } from '../../middleware/workspace.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const createHookSchema = z.object({
  text: z.string().min(1, 'Hook text is required'),
  category: z.string().optional(),
  niche: z.string().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable(),
  performanceNotes: z.string().optional().nullable(),
});

const updateHookSchema = z.object({
  text: z.string().min(1).optional(),
  category: z.string().optional(),
  niche: z.string().optional().nullable(),
  sourceUrl: z.string().url().optional().nullable(),
  performanceNotes: z.string().optional().nullable(),
});

router.use(requireAuth);
router.use(requireWorkspaceMember());

router.get('/hooks', asyncHandler(HookController.list));
router.post('/hooks', validateRequest({ body: createHookSchema }), asyncHandler(HookController.create));
router.patch('/hooks/:id', validateRequest({ body: updateHookSchema }), asyncHandler(HookController.update));
router.delete('/hooks/:id', asyncHandler(HookController.delete));

export default router;
