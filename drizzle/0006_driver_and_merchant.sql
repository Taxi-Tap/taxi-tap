CREATE TYPE "public"."request_status" AS ENUM('pending', 'paid', 'cancelled', 'expired');--> statement-breakpoint
CREATE TABLE "payment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisation_id" uuid NOT NULL,
	"staff_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"code" text NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"transaction_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_requests_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "model" text DEFAULT 'Minibus taxi' NOT NULL;--> statement-breakpoint
ALTER TABLE "vehicles" ADD COLUMN "seats" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_organisation_id_organisations_id_fk" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_staff_id_profiles_id_fk" FOREIGN KEY ("staff_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;