// npm run db:seed
// Loads demo data into your Neon branch. Owner: Londa.
// Must be safe to run twice and must not create users (people sign up in the app).
//
// TODO (Londa): insert the "(demo)" association, businesses, route, fare bands,
// vehicle, stall and organisation wallets in one db.transaction once
// db/schema.ts (TAX-89) has the tables.

import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

console.log("No demo data yet (seed not written).");
