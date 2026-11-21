CREATE TABLE "content_ideas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"concept" text NOT NULL,
	"niche" varchar(120),
	"target_audience" text,
	"format" varchar(60),
	"main_hook" text,
	"alternative_hooks" jsonb DEFAULT '[]'::jsonb,
	"audience_problem" text,
	"viewer_value" text,
	"cta" text,
	"priority_score" numeric(5, 2),
	"score_explanation" jsonb,
	"status" varchar(40) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"text" text NOT NULL,
	"category" varchar(60),
	"niche" varchar(120),
	"source_url" text,
	"source_type" varchar(40),
	"performance_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "idea_research_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"idea_id" uuid NOT NULL,
	"trend_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "research_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"source_type" varchar(60) NOT NULL,
	"url" text,
	"description" text,
	"source_metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trend_observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workspace_id" uuid NOT NULL,
	"research_source_id" uuid,
	"title" varchar(255) NOT NULL,
	"description" text,
	"niche" varchar(120),
	"status" varchar(40) DEFAULT 'emerging' NOT NULL,
	"evidence" jsonb DEFAULT '[]'::jsonb,
	"relevance_score" numeric(5, 2),
	"saturation_estimate" numeric(5, 2),
	"opportunity_score" numeric(5, 2),
	"observed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_ideas" ADD CONSTRAINT "content_ideas_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hooks" ADD CONSTRAINT "hooks_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_research_links" ADD CONSTRAINT "idea_research_links_idea_id_content_ideas_id_fk" FOREIGN KEY ("idea_id") REFERENCES "public"."content_ideas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idea_research_links" ADD CONSTRAINT "idea_research_links_trend_id_trend_observations_id_fk" FOREIGN KEY ("trend_id") REFERENCES "public"."trend_observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "research_sources" ADD CONSTRAINT "research_sources_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trend_observations" ADD CONSTRAINT "trend_observations_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trend_observations" ADD CONSTRAINT "trend_observations_research_source_id_research_sources_id_fk" FOREIGN KEY ("research_source_id") REFERENCES "public"."research_sources"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "content_ideas_workspace_idx" ON "content_ideas" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "content_ideas_status_idx" ON "content_ideas" USING btree ("status");--> statement-breakpoint
CREATE INDEX "content_ideas_format_idx" ON "content_ideas" USING btree ("format");--> statement-breakpoint
CREATE INDEX "content_ideas_niche_idx" ON "content_ideas" USING btree ("niche");--> statement-breakpoint
CREATE INDEX "hooks_workspace_idx" ON "hooks" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "hooks_category_idx" ON "hooks" USING btree ("category");--> statement-breakpoint
CREATE INDEX "hooks_niche_idx" ON "hooks" USING btree ("niche");--> statement-breakpoint
CREATE UNIQUE INDEX "idea_research_links_unique" ON "idea_research_links" USING btree ("idea_id","trend_id");--> statement-breakpoint
CREATE INDEX "idea_research_links_idea_idx" ON "idea_research_links" USING btree ("idea_id");--> statement-breakpoint
CREATE INDEX "idea_research_links_trend_idx" ON "idea_research_links" USING btree ("trend_id");--> statement-breakpoint
CREATE INDEX "research_sources_workspace_idx" ON "research_sources" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "research_sources_type_idx" ON "research_sources" USING btree ("source_type");--> statement-breakpoint
CREATE INDEX "trend_observations_workspace_idx" ON "trend_observations" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "trend_observations_status_idx" ON "trend_observations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "trend_observations_niche_idx" ON "trend_observations" USING btree ("niche");