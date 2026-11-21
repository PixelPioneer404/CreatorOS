import { getDb, schema } from '../../db/index.js';
import { eq, and, desc, ilike } from 'drizzle-orm';
import { ApiError } from '../../utils/api-error.js';
import { AiService } from '../ai/ai.service.js';
import { z } from 'zod';

const singleIdeaSchema = z.preprocess((val) => {
  if (typeof val !== 'object' || val === null) return val;
  const v = { ...val };
  
  // Normalize hook
  const rawHook = v.hook || v.mainHook || v.openingHook || v.firstHook || (Array.isArray(v.alternativeHooks) && v.alternativeHooks[0] ? v.alternativeHooks[0] : '');
  v.hook = typeof rawHook === 'string' ? rawHook.trim() : '';

  // Normalize concept
  let rawConcept = v.concept || v.description || v.summary;
  if (!rawConcept && v.audienceProblem && v.viewerValue) {
    rawConcept = `${v.audienceProblem} ${v.viewerValue}`;
  } else if (!rawConcept) {
    rawConcept = v.audienceProblem || v.viewerValue || (v.hook ? `High-retention reel concept built around: "${v.hook}"` : 'High-impact video concept tailored to creator niche.');
  }
  v.concept = typeof rawConcept === 'string' ? rawConcept.trim() : '';

  // Normalize title
  let rawTitle = v.title || v.videoTitle || v.ideaTitle || v.headline || v.name || v.topic;
  if (!rawTitle || rawTitle.toLowerCase().includes('untitled') || rawTitle.toLowerCase().includes('video concept')) {
    // Generate a punchy title from hook or concept if generic
    if (v.hook && v.hook.length > 5) {
      // Strip trailing punctuation
      const cleanHook = v.hook.replace(/[.!?]+$/, '');
      rawTitle = cleanHook.length > 55 ? cleanHook.slice(0, 52) + '...' : cleanHook;
    } else if (v.concept && v.concept.length > 5) {
      rawTitle = v.concept.slice(0, 50) + '...';
    } else {
      rawTitle = 'High-Impact Viral Reel';
    }
  }
  v.title = typeof rawTitle === 'string' ? rawTitle.trim() : 'Viral Video Angle';

  // Normalize alternativeHooks
  if (!Array.isArray(v.alternativeHooks)) {
    v.alternativeHooks = v.altHooks || v.otherHooks || [];
  }

  // Normalize score
  if (v.prioritizationScore !== undefined) {
    if (typeof v.prioritizationScore === 'object' && v.prioritizationScore !== null) {
      v.score = v.prioritizationScore.total ?? v.prioritizationScore.score ?? 86;
      v.scoreExplanation = v.prioritizationScore.breakdown ?? v.prioritizationScore.explanation ?? v.scoreExplanation;
    } else {
      v.score = Number(v.prioritizationScore) || 86;
    }
  } else if (v.score === undefined) {
    v.score = 86;
  }

  return v;
}, z.object({
  title: z.string().min(1).default('Viral Video Angle'),
  concept: z.string().min(1).default('Actionable high-retention video concept.'),
  hook: z.string().default(''),
  alternativeHooks: z.array(z.string()).catch([]).default([]),
  format: z.string().default('reel'),
  audienceProblem: z.string().optional().default(''),
  viewerValue: z.string().optional().default(''),
  cta: z.string().optional().default(''),
  score: z.coerce.number().min(0).max(100).default(86),
  scoreExplanation: z.record(z.unknown()).optional().default({
    nicheRelevance: 88,
    audienceInterest: 90,
    uniqueness: 82,
    formatSuitability: 92,
    researchSupport: 84,
  }),
}));

const ideasGenerationOutputSchema = z.union([
  z.object({
    ideas: z.array(singleIdeaSchema),
  }),
  z.array(singleIdeaSchema).transform((arr) => ({ ideas: arr })),
]);

export class IdeaService {
  static async listIdeas(workspaceId, { status, niche, format, search } = {}) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const conditions = [eq(schema.contentIdeas.workspaceId, workspaceId)];
    if (status && status !== 'all') conditions.push(eq(schema.contentIdeas.status, status));
    if (niche) conditions.push(eq(schema.contentIdeas.niche, niche));
    if (format && format !== 'all') conditions.push(eq(schema.contentIdeas.format, format));
    if (search) conditions.push(ilike(schema.contentIdeas.title, `%${search}%`));

    return db
      .select()
      .from(schema.contentIdeas)
      .where(and(...conditions))
      .orderBy(desc(schema.contentIdeas.createdAt));
  }

  static async getIdeaById(workspaceId, ideaId) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const [idea] = await db
      .select()
      .from(schema.contentIdeas)
      .where(
        and(
          eq(schema.contentIdeas.id, ideaId),
          eq(schema.contentIdeas.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (!idea) {
      throw ApiError.notFound('Content idea not found.');
    }

    return idea;
  }

  static async createIdea(workspaceId, data) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    // Calculate priority score if not provided
    const score = data.priorityScore !== undefined ? data.priorityScore : 75;

    const [idea] = await db
      .insert(schema.contentIdeas)
      .values({
        workspaceId,
        title: data.title,
        concept: data.concept,
        niche: data.niche || null,
        targetAudience: data.targetAudience || null,
        format: data.format || 'reel',
        mainHook: data.mainHook || null,
        alternativeHooks: data.alternativeHooks || [],
        audienceProblem: data.audienceProblem || null,
        viewerValue: data.viewerValue || null,
        cta: data.cta || null,
        priorityScore: String(score),
        scoreExplanation: data.scoreExplanation || {
          nicheRelevance: 80,
          audienceInterest: 75,
          uniqueness: 70,
          formatSuitability: 85,
          researchSupport: 70,
        },
        status: data.status || 'draft',
      })
      .returning();

    if (data.trendId) {
      await db.insert(schema.ideaResearchLinks).values({
        ideaId: idea.id,
        trendId: data.trendId,
      }).onConflictDoNothing();
    }

    return idea;
  }

  static async updateIdea(workspaceId, ideaId, data) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const [existing] = await db
      .select()
      .from(schema.contentIdeas)
      .where(
        and(
          eq(schema.contentIdeas.id, ideaId),
          eq(schema.contentIdeas.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (!existing) {
      throw ApiError.notFound('Content idea not found.');
    }

    const updates = { updatedAt: new Date() };
    const allowed = [
      'title',
      'concept',
      'niche',
      'targetAudience',
      'format',
      'mainHook',
      'alternativeHooks',
      'audienceProblem',
      'viewerValue',
      'cta',
      'priorityScore',
      'scoreExplanation',
      'status',
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        updates[key] = key === 'priorityScore' ? String(data[key]) : data[key];
      }
    }

    const [updated] = await db
      .update(schema.contentIdeas)
      .set(updates)
      .where(eq(schema.contentIdeas.id, ideaId))
      .returning();

    return updated;
  }

  static async deleteIdea(workspaceId, ideaId) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const [deleted] = await db
      .delete(schema.contentIdeas)
      .where(
        and(
          eq(schema.contentIdeas.id, ideaId),
          eq(schema.contentIdeas.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!deleted) {
      throw ApiError.notFound('Content idea not found.');
    }

    return deleted;
  }

  static async generateAiIdeas(workspaceId, {
    topic,
    niche,
    targetAudience,
    format = 'reel',
    count = 3,
    additionalInstructions = '',
    saveImmediately = false,
  }) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    if (!AiService.isConfigured()) {
      throw ApiError.aiProvider('Google Gemini API key is not configured in server/.env.');
    }

    const systemPrompt = `You are the lead Content Idea Generation engine for Creator OS.
Your objective is to generate structured, actionable, and viral-ready video ideas tailored for content creators.
Return a JSON array of ideas or an object with an "ideas" array.
Each idea must strictly include:
- title: A catchy, specific video title / headline (e.g. "The 15-Minute Metabolic Burn", "Why Your High-Protein Diet Is Failing You"). Never use generic titles like "Untitled" or "Video Concept".
- hook: The exact, punchy spoken opening hook for the first 3 seconds (e.g. "Stop squatting like this if you want actual leg growth.").
- alternativeHooks: An array of 2-3 alternate opening hook lines.
- concept: A rich 2-3 sentence description of the video concept, what happens in the video, and why it retains viewers.
- audienceProblem: The exact pain point or curiosity trigger of the audience.
- viewerValue: The tangible takeaway, tip, or entertaining payoff for the viewer.
- cta: Clear call to action (e.g., save, comment keyword, follow for part 2).
- score: Prioritization score between 75 and 98 based on viral potential and retention likelihood.
- scoreExplanation: An object with numeric scores (0-100) for nicheRelevance, audienceInterest, uniqueness, formatSuitability, and researchSupport.`;

    const userPrompt = `Generate ${count} high-performing content ideas:
Focus Topic: ${topic}
Primary Niche: ${niche}
Target Audience: ${targetAudience || 'General creator audience'}
Target Format: ${format}
${additionalInstructions ? `Special Instructions: ${additionalInstructions}` : ''}`;

    const aiResult = await AiService.generateStructured({
      task: 'ideas.generate',
      systemPrompt,
      userPrompt,
      schema: ideasGenerationOutputSchema,
      temperature: 0.6,
    });

    const generated = aiResult.data.ideas || [];

    if (saveImmediately) {
      const savedList = [];
      for (const item of generated) {
        const saved = await this.createIdea(workspaceId, {
          title: item.title || (item.hook ? item.hook.slice(0, 50) : 'Viral Video Concept'),
          concept: item.concept || (item.audienceProblem ? `${item.audienceProblem} ${item.viewerValue || ''}` : 'Actionable video concept'),
          niche,
          targetAudience,
          format: item.format || format,
          mainHook: item.hook || item.mainHook || '',
          alternativeHooks: Array.isArray(item.alternativeHooks) ? item.alternativeHooks : [],
          audienceProblem: item.audienceProblem || null,
          viewerValue: item.viewerValue || null,
          cta: item.cta || null,
          priorityScore: item.score ?? 86,
          scoreExplanation: item.scoreExplanation,
          status: 'draft',
        });
        savedList.push(saved);
      }
      return { ideas: savedList, generatedCount: savedList.length };
    }

    return { ideas: generated, generatedCount: generated.length };
  }
}
