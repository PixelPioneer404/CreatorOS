import { Router } from 'express';
import { IdeaController } from './idea.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireWorkspaceMember } from '../../middleware/workspace.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const createIdeaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  concept: z.string().min(1, 'Concept is required'),
  niche: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  format: z.string().default('reel'),
  mainHook: z.string().optional().nullable(),
  alternativeHooks: z.array(z.string()).optional(),
  audienceProblem: z.string().optional().nullable(),
  viewerValue: z.string().optional().nullable(),
  cta: z.string().optional().nullable(),
  priorityScore: z.number().min(0).max(100).optional(),
  scoreExplanation: z.record(z.unknown()).optional(),
  status: z.enum(['draft', 'in_progress', 'scripted', 'produced', 'published', 'archived']).default('draft'),
  trendId: z.string().uuid().optional().nullable(),
});

const updateIdeaSchema = z.object({
  title: z.string().min(1).optional(),
  concept: z.string().min(1).optional(),
  niche: z.string().optional().nullable(),
  targetAudience: z.string().optional().nullable(),
  format: z.string().optional(),
  mainHook: z.string().optional().nullable(),
  alternativeHooks: z.array(z.string()).optional(),
  audienceProblem: z.string().optional().nullable(),
  viewerValue: z.string().optional().nullable(),
  cta: z.string().optional().nullable(),
  priorityScore: z.number().min(0).max(100).optional(),
  scoreExplanation: z.record(z.unknown()).optional(),
  status: z.enum(['draft', 'in_progress', 'scripted', 'produced', 'published', 'archived']).optional(),
});

const generateIdeasSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  niche: z.string().min(1, 'Niche is required'),
  targetAudience: z.string().optional(),
  format: z.string().default('reel'),
  count: z.number().int().min(1).max(10).default(3),
  additionalInstructions: z.string().optional(),
  saveImmediately: z.boolean().default(false),
});

router.use(requireAuth);
router.use(requireWorkspaceMember());

router.get('/ideas', asyncHandler(IdeaController.list));
router.post('/ideas', validateRequest({ body: createIdeaSchema }), asyncHandler(IdeaController.create));
router.post('/ideas/generate', validateRequest({ body: generateIdeasSchema }), asyncHandler(IdeaController.generate));
router.get('/ideas/:id', asyncHandler(IdeaController.getById));
router.patch('/ideas/:id', validateRequest({ body: updateIdeaSchema }), asyncHandler(IdeaController.update));
router.delete('/ideas/:id', asyncHandler(IdeaController.delete));

export default router;
