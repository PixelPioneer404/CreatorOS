import { getDb, schema } from '../../db/index.js';
import { eq, and, desc, ilike } from 'drizzle-orm';
import { ApiError } from '../../utils/api-error.js';
import { AiService } from '../ai/ai.service.js';
import { z } from 'zod';

const ideasGenerationOutputSchema = z.object({
  ideas: z.array(z.object({
    title: z.string(),
    concept: z.string(),
    hook: z.string(),
    alternativeHooks: z.array(z.string()).default([]),
    format: z.string().default('reel'),
    audienceProblem: z.string().optional().default(''),
    viewerValue: z.string().optional().default(''),
    cta: z.string().optional().default(''),
    score: z.number().min(0).max(100).default(75),
    scoreExplanation: z.object({
      nicheRelevance: z.number().default(80),
      audienceInterest: z.number().default(80),
      uniqueness: z.number().default(75),
      formatSuitability: z.number().default(85),
      researchSupport: z.number().default(75),
    }).default({}),
  })),
});

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
Each idea must include:
- A high-converting main hook and 2 alternative hooks.
- Clear audience problem being solved.
- Clear viewer value.
- Clear call to action (CTA).
- An explainable prioritization score (0 to 100) with breakdown across nicheRelevance, audienceInterest, uniqueness, formatSuitability, and researchSupport.
Return JSON conforming strictly to the schema.`;

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
          title: item.title,
          concept: item.concept,
          niche,
          targetAudience,
          format: item.format || format,
          mainHook: item.hook,
          alternativeHooks: item.alternativeHooks,
          audienceProblem: item.audienceProblem,
          viewerValue: item.viewerValue,
          cta: item.cta,
          priorityScore: item.score,
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
