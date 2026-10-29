# Tech stack

| Area | Choice |
| --- | --- |
| App | Next.js (latest), App Router, TypeScript, no `src/`, import alias `@/*` |
| UI | shadcn/ui on Tailwind CSS |
| Database | Neon Postgres. One Neon branch per developer. **No Docker.** |
| ORM | Drizzle ORM + drizzle-kit. Driver `drizzle-orm/neon-serverless` with `ws` (the ledger needs `db.transaction`; neon-http can't do it) |
| Auth | BetterAuth with the Drizzle adapter (`provider: "pg"`): email + password, Google, email verification, emailed two-factor codes |
| Tests | Vitest |
| Node | 22 LTS (`.nvmrc` = `22`) |
| Package manager | npm only, lockfile committed, installs via `npm ci` |
| Email | Resend HTTP API when `RESEND_API_KEY` is set; otherwise messages print to the dev server console |
| Hosting | Vercel (app) + Neon (database) |

## Boundary rules

1. Screens never touch the database. They call server actions only, and only `server/` imports `db/`.
2. Every server action checks the signed-in user and role first (`requireUser()` / `requireRole()`).
3. Money moves only through `transfer()`, which debits, credits and records the transaction inside one `db.transaction`.
4. Amounts are whole cents (integers), never decimals.
5. A QR token is signed, carries its wallet ID, expires after 60 seconds and is checked on the server.
6. Each payment carries an idempotency key; a unique index stops double charges.
7. The database only changes through `db/schema.ts` and a generated migration in `drizzle/`.
8. No secrets in the repo; they live in `.env.local` and Vercel settings.

Full write-up: Tech Stack and Project Structure (PDF/Word) in this folder.
