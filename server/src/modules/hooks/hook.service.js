import { getDb, schema } from '../../db/index.js';
import { eq, and, ilike, desc } from 'drizzle-orm';
import { ApiError } from '../../utils/api-error.js';

export const CURATED_HOOK_TEMPLATES = [
  {
    category: 'curiosity',
    text: 'Most people think [common belief], but here is the exact reason why that is completely wrong.',
    performanceNotes: 'High comment retention hook. Ideal for counter-intuitive insights.',
  },
  {
    category: 'contradiction',
    text: 'Stop doing [popular practice]. Do this 2-minute alternative instead.',
    performanceNotes: 'Drives strong immediate saves and shares.',
  },
  {
    category: 'relatability',
    text: 'If you ever feel like you are working 10 hours a day and getting nowhere, watch this.',
    performanceNotes: 'Deep emotional resonance hook. Increases watch time by 40%.',
  },
  {
    category: 'storytelling',
    text: '3 years ago, I had zero [niche asset]. Here are the only 3 habits that actually changed that.',
    performanceNotes: 'Story progression hook. Builds authority and personal connection.',
  },
  {
    category: 'problem_identification',
    text: 'Here is the #1 mistake that is silently killing your [creator goal].',
    performanceNotes: 'Urgency-driven hook. Triggers immediate pause on vertical feeds.',
  },
  {
    category: 'authority',
    text: 'I spent 100 hours analyzing [top authority/system]. Here are the top takeaways in 60 seconds.',
    performanceNotes: 'Curated synthesis hook. High bookmark and save rate.',
  },
  {
    category: 'unexpected_revelation',
    text: 'The secret to [desirable outcome] is not [what everyone says]. It is actually [unexpected factor].',
    performanceNotes: 'Pattern interruption hook. Excellent for Reels and Shorts.',
  },
  {
    category: 'question_based',
    text: 'Why do 90% of creators fail in their first 6 months while a few scale effortlessly?',
    performanceNotes: 'Analytical hook. Sparks engaged debate in the comment section.',
  },
];

export class HookService {
  static async listHooks(workspaceId, { category, niche, search } = {}) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const conditions = [eq(schema.hooks.workspaceId, workspaceId)];
    if (category) conditions.push(eq(schema.hooks.category, category));
    if (niche) conditions.push(eq(schema.hooks.niche, niche));
    if (search) conditions.push(ilike(schema.hooks.text, `%${search}%`));

    let userHooks = await db
      .select()
      .from(schema.hooks)
      .where(and(...conditions))
      .orderBy(desc(schema.hooks.createdAt));

    // If workspace has no hooks yet, auto-seed the curated templates
    if (userHooks.length === 0 && !category && !search) {
      for (const t of CURATED_HOOK_TEMPLATES) {
        await db.insert(schema.hooks).values({
          workspaceId,
          text: t.text,
          category: t.category,
          performanceNotes: t.performanceNotes,
        });
      }
      userHooks = await db
        .select()
        .from(schema.hooks)
        .where(eq(schema.hooks.workspaceId, workspaceId))
        .orderBy(desc(schema.hooks.createdAt));
    }

    return userHooks;
  }

  static async createHook(workspaceId, data) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const [hook] = await db
      .insert(schema.hooks)
      .values({
        workspaceId,
        text: data.text,
        category: data.category || 'curiosity',
        niche: data.niche || null,
        sourceUrl: data.sourceUrl || null,
        sourceType: data.sourceType || 'custom',
        performanceNotes: data.performanceNotes || null,
      })
      .returning();

    return hook;
  }

  static async updateHook(workspaceId, hookId, data) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const [existing] = await db
      .select()
      .from(schema.hooks)
      .where(
        and(
          eq(schema.hooks.id, hookId),
          eq(schema.hooks.workspaceId, workspaceId)
        )
      )
      .limit(1);

    if (!existing) {
      throw ApiError.notFound('Hook not found.');
    }

    const updates = {};
    if (data.text !== undefined) updates.text = data.text;
    if (data.category !== undefined) updates.category = data.category;
    if (data.niche !== undefined) updates.niche = data.niche;
    if (data.sourceUrl !== undefined) updates.sourceUrl = data.sourceUrl;
    if (data.performanceNotes !== undefined) updates.performanceNotes = data.performanceNotes;

    const [updated] = await db
      .update(schema.hooks)
      .set(updates)
      .where(eq(schema.hooks.id, hookId))
      .returning();

    return updated;
  }

  static async deleteHook(workspaceId, hookId) {
    const db = getDb();
    if (!db) throw ApiError.database('Database connection unavailable.');

    const [deleted] = await db
      .delete(schema.hooks)
      .where(
        and(
          eq(schema.hooks.id, hookId),
          eq(schema.hooks.workspaceId, workspaceId)
        )
      )
      .returning();

    if (!deleted) {
      throw ApiError.notFound('Hook not found.');
    }

    return deleted;
  }
}
