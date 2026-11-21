# Creator OS Database Specification (V1: Foundation)

## 1. Overview
Creator OS uses PostgreSQL hosted on Supabase, managed programmatically through **Drizzle ORM**.
All primary keys use UUIDs. All timestamps use `timestamp with time zone` (`TIMESTAMPTZ`).
Foreign keys maintain relational integrity, and indices optimize queries on foreign keys and frequently filtered columns.

## 2. Multi-Tenant Model
The database is structured to support multi-tenancy from day one.
Every user owns or belongs to one or more workspaces. All creator data belongs to a workspace (`workspace_id`), rather than directly to a user ID.

```
users (Supabase Auth mirror)
  │
  ├── 1:M ──> workspace_members <── M:1 ── workspaces
                                                │
                                                └── 1:1 ──> creator_profiles
```

## 3. V1 Core Schema

### A. `users`
Mirrors the authenticated user in Supabase Auth.
- `id` (UUID, Primary Key): Matches Supabase Auth `auth.users.id`.
- `display_name` (VARCHAR(120), Nullable): Default display name.
- `avatar_url` (TEXT, Nullable): URL for user avatar.
- `created_at` (TIMESTAMPTZ, Default `now()`): Creation timestamp.
- `updated_at` (TIMESTAMPTZ, Default `now()`): Last update timestamp.

### B. `workspaces`
Represents an isolated tenant boundary.
- `id` (UUID, Primary Key, Default `gen_random_uuid()`): Unique workspace ID.
- `name` (VARCHAR(150), Not Null): Human-readable workspace name (e.g. "Jane Doe's Studio").
- `slug` (VARCHAR(100), Unique, Not Null): URL-friendly unique identifier.
- `owner_user_id` (UUID, Not Null, References `users.id` on delete cascade): Owner user.
- `created_at` (TIMESTAMPTZ, Default `now()`): Creation timestamp.
- `updated_at` (TIMESTAMPTZ, Default `now()`): Last update timestamp.

### C. `workspace_members`
Junction table managing workspace memberships and roles.
- `id` (UUID, Primary Key, Default `gen_random_uuid()`): Unique membership ID.
- `workspace_id` (UUID, Not Null, References `workspaces.id` on delete cascade): Workspace reference.
- `user_id` (UUID, Not Null, References `users.id` on delete cascade): User reference.
- `role` (VARCHAR(30), Not Null, Default `'owner'`): Member role (`'owner'`, `'admin'`, `'editor'`, `'viewer'`).
- `created_at` (TIMESTAMPTZ, Default `now()`): Creation timestamp.
- **Constraints**: Unique `(workspace_id, user_id)`.

### D. `creator_profiles`
Stores the onboarding and creative identity settings for a workspace.
- `id` (UUID, Primary Key, Default `gen_random_uuid()`): Unique profile ID.
- `workspace_id` (UUID, Not Null, References `workspaces.id` on delete cascade): Workspace reference.
- `display_name` (VARCHAR(150), Not Null): Creator's public or brand name.
- `username` (VARCHAR(100), Nullable): Creator handle.
- `bio` (TEXT, Nullable): Short description of creator's content.
- `primary_niche` (VARCHAR(120), Nullable): Main content niche (e.g. "Tech & AI").
- `secondary_niches` (JSONB, Default `[]`): Secondary niches.
- `primary_platform` (VARCHAR(40), Nullable): Main publishing platform (e.g. "Instagram").
- `other_platforms` (JSONB, Default `[]`): Additional platforms.
- `goals` (JSONB, Default `[]`): Creator objectives.
- `target_audience` (TEXT, Nullable): Description of audience.
- `experience_level` (VARCHAR(50), Nullable): e.g. "Beginner", "Intermediate", "Full-time".
- `preferred_language` (VARCHAR(50), Nullable): e.g. "English".
- `country` (VARCHAR(100), Nullable): Country of origin.
- `timezone` (VARCHAR(100), Nullable): Creator timezone.
- `onboarding_completed` (BOOLEAN, Default `false`): Flag indicating whether onboarding flow finished.
- `created_at` (TIMESTAMPTZ, Default `now()`): Creation timestamp.
- `updated_at` (TIMESTAMPTZ, Default `now()`): Last update timestamp.
- **Constraints**: Unique `(workspace_id)`.

## 4. Migrations
Drizzle Kit is used to generate and execute migrations:
- `npm --workspace=server run db:generate`
- `npm --workspace=server run db:migrate`
Direct edits to production schema are forbidden.
