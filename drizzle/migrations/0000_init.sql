CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"representative_id" integer NOT NULL,
	"action" text NOT NULL,
	"entity_id" integer NOT NULL,
	"before" text,
	"after" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canvass_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"voter_id" integer NOT NULL,
	"representative_id" integer NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"date" text NOT NULL,
	"outcome" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "constituencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"corporation" text NOT NULL,
	"city" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "divisions" (
	"id" serial PRIMARY KEY NOT NULL,
	"constituency_id" integer NOT NULL,
	"division_number" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "representatives" (
	"id" serial PRIMARY KEY NOT NULL,
	"division_id" integer,
	"constituency_id" integer,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"surname" text NOT NULL,
	"name" text NOT NULL,
	"last_name" text NOT NULL,
	"mobile" text NOT NULL,
	"role" text NOT NULL,
	"rep_number" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"bound_device_id" text,
	"device_bound_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_login" timestamp
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "voters" (
	"id" serial PRIMARY KEY NOT NULL,
	"division_id" integer NOT NULL,
	"constituency_id" integer NOT NULL,
	"entered_by" integer NOT NULL,
	"division_number" text NOT NULL,
	"surname" text NOT NULL,
	"name" text NOT NULL,
	"last_name" text NOT NULL,
	"surname_te" text DEFAULT '' NOT NULL,
	"name_te" text DEFAULT '' NOT NULL,
	"last_name_te" text DEFAULT '' NOT NULL,
	"caste" text DEFAULT '' NOT NULL,
	"age" integer NOT NULL,
	"gender" text NOT NULL,
	"epic_id" text NOT NULL,
	"house_number" text NOT NULL,
	"father_husband_name" text NOT NULL,
	"father_husband_name_te" text DEFAULT '' NOT NULL,
	"mobile_number" text DEFAULT '' NOT NULL,
	"is_live" boolean DEFAULT true NOT NULL,
	"is_dead" boolean DEFAULT false NOT NULL,
	"is_alienated" boolean DEFAULT false NOT NULL,
	"is_immigrated" boolean DEFAULT false NOT NULL,
	"is_new_voter" boolean DEFAULT false NOT NULL,
	"booth_visited" boolean DEFAULT false NOT NULL,
	"voted_on_election_day" boolean DEFAULT false NOT NULL,
	"photo_url" text,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_constituency_id_constituencies_id_fk" FOREIGN KEY ("constituency_id") REFERENCES "public"."constituencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "representatives" ADD CONSTRAINT "representatives_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "representatives" ADD CONSTRAINT "representatives_constituency_id_constituencies_id_fk" FOREIGN KEY ("constituency_id") REFERENCES "public"."constituencies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_logs_rep_idx" ON "audit_logs" USING btree ("representative_id");--> statement-breakpoint
CREATE INDEX "divisions_constituency_idx" ON "divisions" USING btree ("constituency_id");--> statement-breakpoint
CREATE UNIQUE INDEX "representatives_username_idx" ON "representatives" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "voters_epic_id_idx" ON "voters" USING btree ("epic_id");--> statement-breakpoint
CREATE INDEX "voters_division_idx" ON "voters" USING btree ("division_id");--> statement-breakpoint
CREATE INDEX "voters_division_updated_idx" ON "voters" USING btree ("division_id","updated_at");