import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';
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
