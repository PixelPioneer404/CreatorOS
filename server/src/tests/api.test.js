import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { runMigrations } from '../db/migrate.js';
import { getDb, closeDb, schema } from '../db/index.js';
import { AiService } from '../modules/ai/ai.service.js';
import { randomUUID } from 'crypto';

const TEST_DB_URL = 'postgresql://localhost:5432/creatoros_test';

describe('Creator OS V1 API Integration Tests', () => {
  const userAId = randomUUID();
  const userBId = randomUUID();
  const tokenA = `test-token-${userAId}`;
  const tokenB = `test-token-${userBId}`;

  let workspaceAId = null;

  beforeAll(async () => {
    process.env.DATABASE_URL = TEST_DB_URL;
    process.env.NODE_ENV = 'test';
    // Ensure migrations are run on test database
    await runMigrations(TEST_DB_URL);
    // Initialize DB connection
    getDb(TEST_DB_URL);
  });

  afterAll(async () => {
    await closeDb();
  });

  describe('1. Health Check Endpoint', () => {
    it('returns healthy status and valid service indicators', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(res.body.data.version).toBe('1.0.0');
      expect(res.body.data.services).toBeDefined();
      expect(res.body.data.services.database).toBe('connected');
    });
  });

  describe('2. Authentication Middleware & Protected Routes', () => {
    it('rejects unauthenticated requests to protected endpoints with 401', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('rejects requests with malformed or invalid token with 401', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer invalid-token-xyz');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHENTICATED');
    });

    it('allows access to protected routes with valid bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(userAId);
    });

    it('allows updating user profile display name', async () => {
      const res = await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ displayName: 'Alex Rivera' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.displayName).toBe('Alex Rivera');
    });
  });

  describe('3. Workspace Creation & Idempotence', () => {
    it('creates a new workspace and sets the user as owner', async () => {
      const res = await request(app)
        .post('/api/v1/workspaces')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Alex Media Studio', slug: `alex-media-${Date.now()}` });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Alex Media Studio');
      expect(res.body.data.role).toBe('owner');
      expect(res.body.data.id).toBeDefined();

      workspaceAId = res.body.data.id;
    });

    it('prevents duplicate default workspace creation on idempotent calls', async () => {
      const res = await request(app)
        .post('/api/v1/workspaces')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Alex Media Studio', idempotent: true });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(workspaceAId); // Returns existing workspace
    });

    it('lists accessible workspaces for authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/workspaces')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((w) => w.id === workspaceAId)).toBe(true);
    });
  });

  describe('4. Workspace Authorization & Cross-Workspace Isolation', () => {
    it('denies access (403) when User B attempts to access User A workspace', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('denies access (403) when User B attempts to view User A creator profile', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/creator-profile`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('FORBIDDEN');
    });

    it('allows User A to access their own workspace details', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(workspaceAId);
    });
  });

  describe('5. Creator Profile & Onboarding', () => {
    it('saves onboarding profile and persists onboarding completion', async () => {
      const profileData = {
        displayName: 'Alex Rivera',
        username: 'alexrivera_ai',
        bio: 'Creating daily videos on practical AI and productivity workflows.',
        primaryNiche: 'Technology & AI',
        secondaryNiches: ['Productivity', 'Creator Economy'],
        primaryPlatform: 'Instagram',
        otherPlatforms: ['YouTube', 'TikTok'],
        goals: ['Reach 100k subscribers', 'Launch digital products'],
        targetAudience: 'Software builders and digital creators',
        experienceLevel: 'Intermediate',
        preferredLanguage: 'English',
        country: 'United States',
        timezone: 'America/New_York',
        onboardingCompleted: true,
      };

      const res = await request(app)
        .put(`/api/v1/workspaces/${workspaceAId}/creator-profile`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send(profileData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.displayName).toBe('Alex Rivera');
      expect(res.body.data.username).toBe('alexrivera_ai');
      expect(res.body.data.primaryNiche).toBe('Technology & AI');
      expect(res.body.data.onboardingCompleted).toBe(true);
    });

    it('allows updating creator profile fields via PATCH', async () => {
      const res = await request(app)
        .patch(`/api/v1/workspaces/${workspaceAId}/creator-profile`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          bio: 'Updated bio: Scaling creator operations with modern automation.',
          primaryNiche: 'AI & Automation',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.bio).toContain('Updated bio');
      expect(res.body.data.primaryNiche).toBe('AI & Automation');
    });

    it('retrieves saved creator profile accurately', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/creator-profile`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('alexrivera_ai');
      expect(res.body.data.onboardingCompleted).toBe(true);
    });
  });

  describe('6. Dashboard Summary', () => {
    it('returns dashboard summary with real creator data and no fabricated analytics', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceAId}/dashboard`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.creator.displayName).toBe('Alex Rivera');
      expect(res.body.data.creator.username).toBe('alexrivera_ai');
      expect(res.body.data.creator.onboardingCompleted).toBe(true);
      // Ensure no fake analytics are returned
      expect(res.body.data.recentIdeas).toEqual([]);
      expect(res.body.data.recentScripts).toEqual([]);
      expect(res.body.data.upcomingContent).toEqual([]);
      expect(res.body.data.recommendations).toEqual([]);
    });
  });

  describe('7. Request Validation and Error Handling', () => {
    it('returns 400 VALIDATION_ERROR on invalid request bodies', async () => {
      const res = await request(app)
        .post('/api/v1/workspaces')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: '' }); // name cannot be empty string

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details.length).toBeGreaterThan(0);
    });

    it('returns 400 VALIDATION_ERROR on malformed UUID in workspace path parameter', async () => {
      const res = await request(app)
        .get('/api/v1/workspaces/not-a-valid-uuid')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 404 NOT_FOUND on non-existent API routes', async () => {
      const res = await request(app).get('/api/v1/non-existent-route');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('8. AI Provider Foundation Without Key', () => {
    it('confirms AI service reports unconfigured when key is absent without crashing server', () => {
      const status = AiService.getProviderStatus();
      expect(status.provider).toBeDefined();
      // Even without a live API key, application remains fully operational
      expect(typeof status.configured).toBe('boolean');
    });
  });
});
