import { Router } from 'express';
import { ResearchController } from './research.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireWorkspaceMember } from '../../middleware/workspace.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { z } from 'zod';

const router = Router({ mergeParams: true });

const startResearchSchema = z.object({
  topic: z.string().optional().default('Current breakout topics and viral reel formats'),
  niche: z.string().optional().default('General'),
  targetAudience: z.string().optional(),
  platform: z.string().default('instagram'),
});

const createSourceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  sourceType: z.string().min(1, 'Source type is required'),
  url: z.string().url().optional().nullable(),
  description: z.string().optional().nullable(),
  sourceMetadata: z.record(z.unknown()).optional(),
});

const createTrendSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  niche: z.string().optional().nullable(),
  status: z.enum(['emerging', 'rising', 'established', 'declining', 'saturated', 'unverified']).default('emerging'),
  evidence: z.array(z.unknown()).optional(),
  relevanceScore: z.number().min(0).max(100).optional(),
  saturationEstimate: z.number().min(0).max(100).optional(),
  opportunityScore: z.number().min(0).max(100).optional(),
  researchSourceId: z.string().uuid().optional().nullable(),
});

const updateTrendSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  niche: z.string().optional().nullable(),
  status: z.enum(['emerging', 'rising', 'established', 'declining', 'saturated', 'unverified']).optional(),
  evidence: z.array(z.unknown()).optional(),
  relevanceScore: z.number().min(0).max(100).optional(),
  saturationEstimate: z.number().min(0).max(100).optional(),
  opportunityScore: z.number().min(0).max(100).optional(),
});

router.use(requireAuth);
router.use(requireWorkspaceMember());

// Research Sources endpoints
router.get('/research/trending-radar', asyncHandler(ResearchController.getTrendingRadar));
router.get('/research/sources', asyncHandler(ResearchController.listSources));
router.post('/research/sources', validateRequest({ body: createSourceSchema }), asyncHandler(ResearchController.createSource));

// Research Trends endpoints
router.get('/research/trends', asyncHandler(ResearchController.listTrends));
router.post('/research/trends', validateRequest({ body: createTrendSchema }), asyncHandler(ResearchController.createTrend));
router.patch('/research/trends/:id', validateRequest({ body: updateTrendSchema }), asyncHandler(ResearchController.updateTrend));
router.delete('/research/trends/:id', asyncHandler(ResearchController.deleteTrend));

// Research Synthesis endpoints
router.post('/research/start', validateRequest({ body: startResearchSchema }), asyncHandler(ResearchController.startResearch));
router.post('/research', validateRequest({ body: startResearchSchema }), asyncHandler(ResearchController.startResearch));
router.get('/research', asyncHandler(ResearchController.listSources));

// Alias endpoints for convenience
router.get('/trends', asyncHandler(ResearchController.listTrends));
router.post('/trends', validateRequest({ body: createTrendSchema }), asyncHandler(ResearchController.createTrend));
router.patch('/trends/:id', validateRequest({ body: updateTrendSchema }), asyncHandler(ResearchController.updateTrend));
router.delete('/trends/:id', asyncHandler(ResearchController.deleteTrend));

export default router;
