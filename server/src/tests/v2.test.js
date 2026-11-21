import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { runMigrations } from '../db/migrate.js';
import { getDb, closeDb, schema } from '../db/index.js';
import { randomUUID } from 'crypto';

const TEST_DB_URL = 'postgresql://localhost:5432/creatoros_test';

describe('Creator OS V2: Research & Idea Engine Tests', () => {
  const userAId = randomUUID();
  const userBId = randomUUID();
  const tokenA = `test-token-${userAId}`;
  const tokenB = `test-token-${userBId}`;

  let workspaceAId = null;
  let workspaceBId = null;
  let createdTrendId = null;
  let createdHookId = null;
  let createdIdeaId = null;

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DB_URL;
    process.env.NODE_ENV = 'test';
    await runMigrations(TEST_DB_URL);
    getDb(TEST_DB_URL);

    // Setup Workspace A
    const resA = await request(app)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ name: 'Alpha Studio' });
    workspaceAId = resA.body.data.id;

    // Setup Workspace B
    const resB = await request(app)
      .post('/api/v1/workspaces')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ name: 'Beta Studio' });
    workspaceBId = resB.body.data.id;
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('1. Hook Intelligence Database', () => {
    it('auto-seeds curated hook templates on first query if workspace has no hooks', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/hooks`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);

      const curiosityHook = res.body.data.find((h) => h.category === 'curiosity');
      expect(curiosityHook).toBeDefined();
      expect(curiosityHook.text).toContain('Most people think');
    });

    it('filters hooks by category and search keyword', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/hooks?category=contradiction`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.every((h) => h.category === 'contradiction')).toBe(true);
    });

    it('creates a custom creator hook', async () => {
      const res = await request(app)
        .post(`/api/v1/workspaces/${workspaceAId}/hooks`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          text: 'Never use this editing style if you want 70% retention.',
          category: 'problem_identification',
          niche: 'video_editing',
          performanceNotes: 'High bookmark potential for tutorial creators',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.text).toBe('Never use this editing style if you want 70% retention.');
      expect(res.body.data.workspaceId).toBe(workspaceAId);
      createdHookId = res.body.data.id;
    });

    it('updates a custom hook', async () => {
      const res = await request(app)
        .patch(`/api/v1/workspaces/${workspaceAId}/hooks/${createdHookId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          performanceNotes: 'Updated: 85% retention verified in test run',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.performanceNotes).toContain('85% retention');
    });

    it('deletes a hook', async () => {
      const res = await request(app)
        .delete(`/api/v1/workspaces/${workspaceAId}/hooks/${createdHookId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(204);
    });
  });

  describe('2. Research Lab & Trend Discovery', () => {
    let sourceId = null;

    it('creates a research source record', async () => {
      const res = await request(app)
        .post(`/api/v1/workspaces/${workspaceAId}/research/sources`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'AI Video Tools Landscape 2026',
          sourceType: 'competitor_analysis',
          url: 'https://youtube.com/watch?v=sample123',
          description: 'Breakdown of viral AI video editing workflows',
          sourceMetadata: { channel: 'AI Creators Hub', subscribers: 250000 },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('AI Video Tools Landscape 2026');
      expect(res.body.data.workspaceId).toBe(workspaceAId);
      sourceId = res.body.data.id;
    });

    it('lists research sources for the workspace', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/research/sources`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].id).toBe(sourceId);
    });

    it('creates a trend observation with opportunity score and status', async () => {
      const res = await request(app)
        .post(`/api/v1/workspaces/${workspaceAId}/research/trends`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Local AI Voice Cloning for Vertical Video',
          description: 'Creators shifting from cloud voice services to on-device zero-latency models.',
          niche: 'ai_tools',
          status: 'emerging',
          evidence: [{ platform: 'tiktok', views: 1200000 }],
          relevanceScore: 88,
          saturationEstimate: 25,
          opportunityScore: 92,
          researchSourceId: sourceId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Local AI Voice Cloning for Vertical Video');
      expect(parseFloat(res.body.data.opportunityScore)).toBe(92);
      expect(res.body.data.status).toBe('emerging');
      createdTrendId = res.body.data.id;
    });

    it('updates trend status to rising and adjusts opportunity score', async () => {
      const res = await request(app)
        .patch(`/api/v1/workspaces/${workspaceAId}/research/trends/${createdTrendId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          status: 'rising',
          opportunityScore: 95,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('rising');
      expect(parseFloat(res.body.data.opportunityScore)).toBe(95);
    });

    it('lists trends filtered by status and niche', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/research/trends?status=rising`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].status).toBe('rising');
    });
  });

  describe('3. Idea Studio Management', () => {
    it('creates a content idea manually with hooks and prioritization score', async () => {
      const res = await request(app)
        .post(`/api/v1/workspaces/${workspaceAId}/ideas`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: '3 Local AI Tools You Can Run Completely Offline',
          concept: 'Step-by-step showcase of private, open-source AI utilities for creative workflows.',
          niche: 'ai_tools',
          targetAudience: 'Content creators and privacy-conscious builders',
          format: 'reel',
          mainHook: 'You do not need an internet connection to run these 3 mind-blowing AI tools.',
          alternativeHooks: [
            'Stop paying \$20/month for cloud AI when these 3 run free on your laptop.',
            'The secret offline AI stack top creators use that no one talks about.',
          ],
          audienceProblem: 'High API costs and privacy concerns with cloud AI tools',
          viewerValue: 'Discover completely free and offline alternatives with setup steps',
          cta: 'Comment OFFLINE and I will DM you the direct download links.',
          priorityScore: 89,
          scoreExplanation: {
            nicheRelevance: 90,
            audienceInterest: 92,
            uniqueness: 85,
            formatSuitability: 95,
            researchSupport: 82,
          },
          status: 'draft',
          trendId: createdTrendId,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      createdIdeaId = res.body.data.id;
      expect(res.body.data.title).toBe('3 Local AI Tools You Can Run Completely Offline');
      expect(parseFloat(res.body.data.priorityScore)).toBe(89);
      expect(res.body.data.status).toBe('draft');
      expect(res.body.data.alternativeHooks.length).toBe(2);
    });

    it('retrieves the idea by ID', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/ideas/${createdIdeaId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdIdeaId);
      expect(res.body.data.mainHook).toContain('internet connection');
    });

    it('updates idea status to in_progress and adjusts title', async () => {
      const res = await request(app)
        .patch(`/api/v1/workspaces/${workspaceAId}/ideas/${createdIdeaId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          status: 'in_progress',
          title: '3 Local AI Tools You Can Run Completely Offline [2026 Edition]',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('in_progress');
      expect(res.body.data.title).toContain('[2026 Edition]');
    });

    it('lists ideas filtered by format and search term', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/ideas?format=reel&search=Offline`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].id).toBe(createdIdeaId);
    });

    it('reflects updated real ideas count on dashboard summary', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/dashboard`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data.recentIdeas.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.quickStats.ideasCount).toBeGreaterThanOrEqual(1);
      expect(res.body.data.quickStats.trendsCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4. Workspace Authorization & Isolation for V2 Resources', () => {
    it('prevents User B from accessing User A research trends (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/research/trends`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('prevents User B from accessing User A hooks (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/hooks`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('prevents User B from accessing User A ideas (403 Forbidden)', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/ideas`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('prevents User B from modifying User A idea (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/v1/workspaces/${workspaceAId}/ideas/${createdIdeaId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Hacked Idea' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });
  });
});
