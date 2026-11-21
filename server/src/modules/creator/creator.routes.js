import { Router } from 'express';
import { CreatorController } from './creator.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireWorkspaceMember } from '../../middleware/workspace.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const workspaceIdParamSchema = z.object({
  workspaceId: z.string().uuid(),
});

const putProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(150),
  username: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  primaryNiche: z.string().max(120).optional().nullable(),
  secondaryNiches: z.array(z.string()).optional(),
  primaryPlatform: z.string().max(40).optional().nullable(),
  otherPlatforms: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  targetAudience: z.string().max(1000).optional().nullable(),
  experienceLevel: z.string().max(50).optional().nullable(),
  preferredLanguage: z.string().max(50).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  timezone: z.string().max(100).optional().nullable(),
  onboardingCompleted: z.boolean().optional(),
});

const patchProfileSchema = z.object({
  displayName: z.string().min(1).max(150).optional(),
  username: z.string().max(100).optional().nullable(),
  bio: z.string().max(1000).optional().nullable(),
  primaryNiche: z.string().max(120).optional().nullable(),
  secondaryNiches: z.array(z.string()).optional(),
  primaryPlatform: z.string().max(40).optional().nullable(),
  otherPlatforms: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  targetAudience: z.string().max(1000).optional().nullable(),
  experienceLevel: z.string().max(50).optional().nullable(),
  preferredLanguage: z.string().max(50).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  timezone: z.string().max(100).optional().nullable(),
  onboardingCompleted: z.boolean().optional(),
});

router.use(requireAuth);
router.use(validateRequest({ params: workspaceIdParamSchema }));
router.use(requireWorkspaceMember());

router.get('/creator-profile', asyncHandler(CreatorController.getProfile));
router.put(
  '/creator-profile',
  validateRequest({ body: putProfileSchema }),
  asyncHandler(CreatorController.upsertProfile)
);
router.patch(
  '/creator-profile',
  validateRequest({ body: patchProfileSchema }),
  asyncHandler(CreatorController.updateProfile)
);

router.get('/dashboard', asyncHandler(CreatorController.getDashboard));

export default router;
