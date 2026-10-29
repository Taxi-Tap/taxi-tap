ALTER TABLE "qr_tokens" ADD COLUMN "code" text;--> statement-breakpoint
ALTER TABLE "qr_tokens" ADD CONSTRAINT "qr_tokens_code_unique" UNIQUE("code");