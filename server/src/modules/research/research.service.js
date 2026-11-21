import { getDb, schema } from '../../db/index.js';
import { eq, and, desc, ilike } from 'drizzle-orm';
import { ApiError } from '../../utils/api-error.js';
import { AiService } from '../ai/ai.service.js';
import { z } from 'zod';

const singleTrendSchema = z.object({
  title: z.string().default('Emerging Trend'),
  description: z.string().default(''),
  status: z.string().transform((s) => {
    const valid = ['emerging', 'rising', 'established', 'declining', 'saturated', 'unverified'];
    const lower = s?.toLowerCase();
    return valid.includes(lower) ? lower : 'emerging';
  }).default('emerging'),
  opportunityScore: z.coerce.number().min(0).max(100).default(85),
  saturationEstimate: z.coerce.number().min(0).max(100).default(35),
  relevanceScore: z.coerce.number().min(0).max(100).default(80),
  suggestedAngles: z.array(z.string()).catch([]).default([]),
  recommendedHooks: z.array(z.string()).catch([]).default([]),
});

const researchOutputSchema = z.union([
  z.object({
    topic: z.string().optional().default('Niche Trends'),
    summary: z.string().optional().default('Analyzed emerging trend signals across social platforms.'),
    trends: z.array(singleTrendSchema).default([]),
    contentGaps: z.array(z.string()).catch([]).default([]),
  }),
  z.array(singleTrendSchema).transform((arr) => ({
    topic: 'Niche Trends',
    summary: 'Analyzed emerging trend signals across social platforms.',
    trends: arr,
    contentGaps: [],
  })),
]);

export class ResearchService {
  static async listSources(workspaceId, { sourceType, search } = {}) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const conditions = [eq(schema.researchSources.workspaceId, workspaceId)];
    if (sourceType) conditions.push(eq(schema.researchSources.sourceType, sourceType));
    if (search) conditions.push(ilike(schema.researchSources.title, `%${search}%`));

    return db
      .select()
      .from(schema.researchSources)
      .where(and(...conditions))
      .orderBy(desc(schema.researchSources.createdAt));
  }

  static async createSource(workspaceId, data) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const [source] = await db
      .insert(schema.researchSources)
      .values({
        workspaceId,
        title: data.title,
        sourceType: data.sourceType,
        url: data.url || null,
        description: data.description || null,
        sourceMetadata: data.sourceMetadata || {},
      })
      .returning();

    return source;
  }

  static async listTrends(workspaceId, { status, niche, search } = {}) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const conditions = [eq(schema.trendObservations.workspaceId, workspaceId)];
    if (status) conditions.push(eq(schema.trendObservations.status, status));
    if (niche) conditions.push(eq(schema.trendObservations.niche, niche));
    if (search) conditions.push(ilike(schema.trendObservations.title, `%${search}%`));

    return db
      .select()
      .from(schema.trendObservations)
      .where(and(...conditions))
      .orderBy(desc(schema.trendObservations.observedAt));
  }

  static async createTrend(workspaceId, data) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const [trend] = await db
      .insert(schema.trendObservations)
      .values({
        workspaceId,
        researchSourceId: data.researchSourceId || null,
        title: data.title,
        description: data.description || null,
        niche: data.niche || null,
        status: data.status || 'emerging',
        evidence: data.evidence || [],
        relevanceScore: data.relevanceScore !== undefined ? String(data.relevanceScore) : null,
        saturationEstimate: data.saturationEstimate !== undefined ? String(data.saturationEstimate) : null,
        opportunityScore: data.opportunityScore !== undefined ? String(data.opportunityScore) : null,
      })
      .returning();

    return trend;
  }

  static async updateTrend(workspaceId, trendId, data) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const [existing] = await db
      .select()
      .from(schema.trendObservations)
      .where(
        and(
          eq(schema.trendObservations.id, trendId),
          eq(schema.trendObservations.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (!existing) {
      throw ApiError.notFound('Trend observation not found.');
    }

    const updates = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.niche !== undefined) updates.niche = data.niche;
    if (data.status !== undefined) updates.status = data.status;
    if (data.evidence !== undefined) updates.evidence = data.evidence;
    if (data.relevanceScore !== undefined) updates.relevanceScore = String(data.relevanceScore);
    if (data.saturationEstimate !== undefined) updates.saturationEstimate = String(data.saturationEstimate);
    if (data.opportunityScore !== undefined) updates.opportunityScore = String(data.opportunityScore);

    const [updated] = await db
      .update(schema.trendObservations)
      .set(updates)
      .where(eq(schema.trendObservations.id, trendId))
      .returning();

    return updated;
  }

  static async deleteTrend(workspaceId, trendId) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const [deleted] = await db
      .delete(schema.trendObservations)
      .where(
        and(
          eq(schema.trendObservations.id, trendId),
          eq(schema.trendObservations.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!deleted) {
      throw ApiError.notFound('Trend observation not found.');
    }

    return deleted;
  }

  static async startResearchTask(workspaceId, { topic, niche, targetAudience, platform = 'instagram' }) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    // Save a research source record for this investigation
    const source = await this.createSource(workspaceId, {
      title: `Research: ${topic}`,
      sourceType: 'manual',
      description: `Analysis for ${niche} (${targetAudience || 'General audience'}) on ${platform}`,
      sourceMetadata: { topic, niche, targetAudience, platform },
    });

    if (!AiService.isConfigured()) {
      // Return structured unconfigured guidance
      return {
        source,
        summary: `AI provider is not configured. Manual research record created for '${topic}'. Configure your Gemini API key to enable automatic AI trend synthesis.`,
        trends: [],
        contentGaps: [],
      };
    }

    try {
      const systemPrompt = `You are the lead Trend Discovery & Research Engine for Creator OS.
Given a niche, topic, and audience, identify emerging creator trends, opportunities, saturation levels, and actionable content angles.
Provide realistic, analytical assessments without generic buzzwords.
Return JSON conforming strictly to the requested schema.`;

      const userPrompt = `Analyze current trends and content opportunities:
Topic: ${topic}
Niche: ${niche}
Target Audience: ${targetAudience || 'Creators & builders'}
Platform: ${platform}`;

      const aiResponse = await AiService.generateStructured({
        task: 'research.analyze_trend',
        systemPrompt,
        userPrompt,
        schema: researchOutputSchema,
        temperature: 0.3,
      });

      const { data } = aiResponse;

      // Automatically store analyzed trends in workspace
      const savedTrends = [];
      for (const t of data.trends || []) {
        const [saved] = await db
          .insert(schema.trendObservations)
          .values({
            workspaceId,
            researchSourceId: source.id,
            title: t.title,
            description: t.description,
            niche,
            status: t.status || 'emerging',
            evidence: [
              { type: 'ai_analysis', contentGaps: data.contentGaps, angles: t.suggestedAngles, hooks: t.recommendedHooks },
            ],
            relevanceScore: String(t.relevanceScore),
            saturationEstimate: String(t.saturationEstimate),
            opportunityScore: String(t.opportunityScore),
          })
          .returning();
        savedTrends.push({ ...saved, angles: t.suggestedAngles, hooks: t.recommendedHooks });
      }

      return {
        source,
        summary: data.summary,
        trends: savedTrends,
        contentGaps: data.contentGaps,
      };
    } catch (err) {
      return {
        source,
        summary: `Research record created. Automated AI synthesis encountered: ${err.message}`,
        trends: [],
        contentGaps: [],
      };
    }
  }
}
