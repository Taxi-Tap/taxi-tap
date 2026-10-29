CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL,
	"verified" boolean DEFAULT true,
	"failed_verification_count" integer DEFAULT 0,
	"locked_until" timestamp
);
--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "organisations" ADD COLUMN "join_code" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "two_factor_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "two_factor" ADD CONSTRAINT "two_factor_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "twoFactor_secret_idx" ON "two_factor" USING btree ("secret");--> statement-breakpoint
CREATE INDEX "twoFactor_userId_idx" ON "two_factor" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_join_code_unique" UNIQUE("join_code");