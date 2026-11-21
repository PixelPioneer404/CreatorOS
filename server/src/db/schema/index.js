import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, numeric, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/**
 * Users Table
 * Matches Supabase Auth user ID (UUID)
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  displayName: varchar('display_name', { length: 120 }),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Workspaces Table
 * Represents the multi-tenant isolation boundary
 */
export const workspaces = pgTable('workspaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 150 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  ownerUserId: uuid('owner_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('workspaces_slug_unique').on(table.slug),
  index('workspaces_owner_idx').on(table.ownerUserId),
]);

/**
 * Workspace Members Table
 * Connects users to workspaces with roles
 */
export const workspaceMembers = pgTable('workspace_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 30 }).notNull().default('owner'), // owner, admin, editor, viewer
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('workspace_members_workspace_user_unique').on(table.workspaceId, table.userId),
  index('workspace_members_user_idx').on(table.userId),
  index('workspace_members_workspace_idx').on(table.workspaceId),
]);

/**
 * Creator Profiles Table
 * Holds creator identity, onboarding preferences, and audience context
 */
export const creatorProfiles = pgTable('creator_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  displayName: varchar('display_name', { length: 150 }).notNull(),
  username: varchar('username', { length: 100 }),
  bio: text('bio'),
  primaryNiche: varchar('primary_niche', { length: 120 }),
  secondaryNiches: jsonb('secondary_niches').default(sql`'[]'::jsonb`),
  primaryPlatform: varchar('primary_platform', { length: 40 }),
  otherPlatforms: jsonb('other_platforms').default(sql`'[]'::jsonb`),
  goals: jsonb('goals').default(sql`'[]'::jsonb`),
  targetAudience: text('target_audience'),
  experienceLevel: varchar('experience_level', { length: 50 }),
  preferredLanguage: varchar('preferred_language', { length: 50 }),
  country: varchar('country', { length: 100 }),
  timezone: varchar('timezone', { length: 100 }),
  onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('creator_profiles_workspace_unique').on(table.workspaceId),
  index('creator_profiles_workspace_idx').on(table.workspaceId),
  index('creator_profiles_username_idx').on(table.username),
]);

/**
 * Research Sources Table (V2)
 * Holds references, external trend URLs, platform sources
 */
export const researchSources = pgTable('research_sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  sourceType: varchar('source_type', { length: 60 }).notNull(), // url, google_trends, tiktok, youtube, manual, social_listening
  url: text('url'),
  description: text('description'),
  sourceMetadata: jsonb('source_metadata').default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('research_sources_workspace_idx').on(table.workspaceId),
  index('research_sources_type_idx').on(table.sourceType),
]);

/**
 * Trend Observations Table (V2)
 * Holds detected/analyzed trends with lifecycle status and opportunity score
 */
export const trendObservations = pgTable('trend_observations', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  researchSourceId: uuid('research_source_id')
    .references(() => researchSources.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  niche: varchar('niche', { length: 120 }),
  status: varchar('status', { length: 40 }).notNull().default('emerging'), // emerging, rising, established, declining, saturated, unverified
  evidence: jsonb('evidence').default(sql`'[]'::jsonb`),
  relevanceScore: numeric('relevance_score', { precision: 5, scale: 2 }),
  saturationEstimate: numeric('saturation_estimate', { precision: 5, scale: 2 }),
  opportunityScore: numeric('opportunity_score', { precision: 5, scale: 2 }),
  observedAt: timestamp('observed_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('trend_observations_workspace_idx').on(table.workspaceId),
  index('trend_observations_status_idx').on(table.status),
  index('trend_observations_niche_idx').on(table.niche),
]);

/**
 * Hooks Library Table (V2)
 * Categorized repository of high-converting opening hooks
 */
export const hooks = pgTable('hooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  category: varchar('category', { length: 60 }), // curiosity, contradiction, relatability, problem_identification, storytelling, authority, controversy, transformation, question_based, unexpected_revelation
  niche: varchar('niche', { length: 120 }),
  sourceUrl: text('source_url'),
  sourceType: varchar('source_type', { length: 40 }),
  performanceNotes: text('performance_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('hooks_workspace_idx').on(table.workspaceId),
  index('hooks_category_idx').on(table.category),
  index('hooks_niche_idx').on(table.niche),
]);

/**
 * Content Ideas Table (V2)
 * Structured ideation engine with weighted scores, hooks, and problem definitions
 */
export const contentIdeas = pgTable('content_ideas', {
  id: uuid('id').defaultRandom().primaryKey(),
  workspaceId: uuid('workspace_id')
    .notNull()
    .references(() => workspaces.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  concept: text('concept').notNull(),
  niche: varchar('niche', { length: 120 }),
  targetAudience: text('target_audience'),
  format: varchar('format', { length: 60 }), // reel, carousel, story, post, long_video, newsletter
  mainHook: text('main_hook'),
  alternativeHooks: jsonb('alternative_hooks').default(sql`'[]'::jsonb`),
  audienceProblem: text('audience_problem'),
  viewerValue: text('viewer_value'),
  cta: text('cta'),
  priorityScore: numeric('priority_score', { precision: 5, scale: 2 }),
  scoreExplanation: jsonb('score_explanation'), // { nicheRelevance, audienceInterest, uniqueness, formatSuitability, researchSupport }
  status: varchar('status', { length: 40 }).notNull().default('draft'), // draft, approved, archived
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('content_ideas_workspace_idx').on(table.workspaceId),
  index('content_ideas_status_idx').on(table.status),
  index('content_ideas_format_idx').on(table.format),
  index('content_ideas_niche_idx').on(table.niche),
]);

/**
 * Idea Research Links Table (V2)
 * Junction table connecting content ideas to research trends
 */
export const ideaResearchLinks = pgTable('idea_research_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  ideaId: uuid('idea_id')
    .notNull()
    .references(() => contentIdeas.id, { onDelete: 'cascade' }),
  trendId: uuid('trend_id')
    .notNull()
    .references(() => trendObservations.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idea_research_links_unique').on(table.ideaId, table.trendId),
  index('idea_research_links_idea_idx').on(table.ideaId),
  index('idea_research_links_trend_idx').on(table.trendId),
]);

