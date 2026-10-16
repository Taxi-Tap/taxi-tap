# 0001: Neon + Drizzle, no Docker

Status: accepted

## Context

Taxi Tap needs a relational database: the capstone asks for SQL, an ERD and a schema script, and the wallet ledger needs real transactions. Four developers work on different laptops (Windows and macOS) and need the same setup without much time to maintain it.

## Decision

- **Neon Postgres + Drizzle ORM** instead of Convex. Convex has no SQL, ERD or schema script; Postgres does. Drizzle keeps the schema in TypeScript (`db/schema.ts`) and generates plain SQL migrations (`drizzle/`), which are the schema script.
- **No Docker.** Each developer gets their own Neon branch (`dev-<name>`), so nobody runs a local database. `npm run setup` and `npm run doctor` keep laptops the same.
- **`drizzle-orm/neon-serverless` driver** (WebSockets) instead of `neon-http`, because `transfer()` needs interactive `db.transaction` calls.

## Consequences

- An internet connection is needed to run the app locally.
- Schema changes always go through `db/schema.ts` + `npm run db:generate`, so the SQL history is in Git.
- Neon's free tier limits apply; branches that are no longer used should be deleted.
