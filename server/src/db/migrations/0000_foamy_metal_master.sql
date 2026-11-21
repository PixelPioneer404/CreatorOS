CREATE TABLE "creator_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"display_name" varchar(150) NOT NULL,
	"username" varchar(100),
	"bio" text,
	"primary_niche" varchar(120),
	"secondary_niches" jsonb DEFAULT '[]'::jsonb,
	"primary_platform" varchar(40),
	"other_platforms" jsonb DEFAULT '[]'::jsonb,
	"goals" jsonb DEFAULT '[]'::jsonb,
	"target_audience" text,
	"experience_level" varchar(50),
	"preferred_language" varchar(50),
	"country" varchar(100),
	"timezone" varchar(100),
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" varchar(120),
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspace_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(30) DEFAULT 'owner' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workspaces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "creator_profiles_workspace_unique" ON "creator_profiles" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "creator_profiles_workspace_idx" ON "creator_profiles" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "creator_profiles_username_idx" ON "creator_profiles" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "workspace_members_workspace_user_unique" ON "workspace_members" USING btree ("workspace_id","user_id");--> statement-breakpoint
CREATE INDEX "workspace_members_user_idx" ON "workspace_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workspace_members_workspace_idx" ON "workspace_members" USING btree ("workspace_id");--> statement-breakpoint
CREATE UNIQUE INDEX "workspaces_slug_unique" ON "workspaces" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "workspaces_owner_idx" ON "workspaces" USING btree ("owner_user_id");