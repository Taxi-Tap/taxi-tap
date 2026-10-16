import { defineConfig } from "drizzle-kit";
import { existsSync } from "node:fs";

// Load .env.local without extra packages (Node 22).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: ["./db/schema.ts", "./db/auth-schema.ts"],
  out: "./drizzle", // generated SQL migrations = the Week 3 schema script
  dbCredentials: { url: process.env.DATABASE_URL! },
  strict: true,
  verbose: true,
});
