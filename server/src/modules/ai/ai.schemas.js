import { z } from 'zod';

export const AI_TASK_TYPES = [
  'research.summarize',
  'research.analyze_trend',
  'ideas.generate',
  'ideas.score',
  'scripts.generate',
  'scripts.analyze',
  'scripts.rewrite',
  'publishing.caption',
  'publishing.hashtags',
  'audience.classify_comments',
  'crm.extract_deal',
  'portfolio.rank_content',
];

export const aiTaskSchema = z.enum(AI_TASK_TYPES);

export const generateTextOptionsSchema = z.object({
  task: aiTaskSchema,
  systemPrompt: z.string().min(1),
  userPrompt: z.string().min(1),
  responseFormat: z.enum(['text', 'json']).default('text'),
  temperature: z.number().min(0).max(2).default(0.7),
});

export const generateStructuredOptionsSchema = z.object({
  task: aiTaskSchema,
  systemPrompt: z.string().min(1),
  userPrompt: z.string().min(1),
  schema: z.instanceof(z.ZodType),
  temperature: z.number().min(0).max(2).default(0.4),
});

export const analyzeOptionsSchema = z.object({
  task: aiTaskSchema,
  input: z.unknown(),
  outputSchema: z.instanceof(z.ZodType),
});
