ALTER TABLE "transactions" DROP CONSTRAINT "transactions_amount_cents_positive";--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "amount_cents" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "requested_amount" text;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_amount_cents_positive" CHECK ("transactions"."amount_cents" > 0 OR ("transactions"."amount_cents" IS NULL AND "transactions"."status" = 'failed' AND "transactions"."requested_amount" IS NOT NULL));