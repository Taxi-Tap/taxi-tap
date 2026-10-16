# Taxi Tap

Taxi Tap is a phone-first web app that gives commuters one digital wallet for minibus taxi fares, service providers and informal traders. Passengers pay by QR code or NFC tap; owners see takings per vehicle and route. **All money in this app is simulated.** Group 4, CTU Durban (SE2/SPM622).

## Stack

| Area | Choice |
| --- | --- |
| App | Next.js (latest), App Router, TypeScript, no `src/`, import alias `@/*` |
| UI | shadcn/ui on Tailwind CSS |
| Database | Neon Postgres. One Neon branch per developer. **No Docker.** |
| ORM | Drizzle ORM + drizzle-kit. Driver `drizzle-orm/neon-serverless` with `ws` (the ledger needs `db.transaction`; neon-http can't do it) |
| Auth | BetterAuth with the Drizzle adapter (`provider: "pg"`) |
| Tests | Vitest |
| Node | 22 LTS (`.nvmrc` = `22`) |
| Package manager | npm only, lockfile committed, installs via `npm ci` |
| Hosting | Vercel (app) + Neon (database) |

## Setup

1. Install Node 22 LTS and Git. `node -v` must start with `v22`.
2. Clone the repo and open it: `git clone https://github.com/Taxi-Tap/taxi-tap.git`, then `cd taxi-tap`.
3. Neon console → Taxi Tap project → Branches → create `dev-<yourname>` from `main` → copy the **pooled** connection string.
4. `npm run setup` (the first run creates `.env.local` and stops).
5. Fill in `.env.local`, then run `npm run setup` again.
6. `npm run dev` → http://localhost:3000. Problems? Run `npm run doctor`.

### Daily commands

| Command | What it does |
| --- | --- |
| `npm run setup` | Installs exact packages, checks `.env.local`, connects to Neon, migrates, seeds |
| `npm run doctor` | Checks your laptop is ready. Changes nothing |
| `npm run check` | Lint + typecheck + tests (the same as CI) |
| `npm run db:generate` | Writes a new SQL migration in `drizzle/` from `db/schema.ts` |
| `npm run db:migrate` | Applies migrations to your Neon branch |
| `npm run db:studio` | Opens Drizzle Studio to browse your data |
| `npm run db:seed` | Loads demo data |

## Folder owners

| Folder / file | Owner |
| --- | --- |
| `app/(auth)`, `app/(customer)`, `app/(merchant)` | Chris |
| `app/(reader)`, `components/qr`, `server/qr.ts` | Chris |
| `db/schema.ts`, `drizzle/` | Chris |
| `components/nfc`, `lib/nfc.ts` | Londa |
| other `server/` actions, `scripts/seed.ts` | Londa |
| `app/(owner)`, `components/maps`, `components/ui` | Lethu |
| `server/auth.ts`, `scripts/setup.mjs`, `scripts/doctor.mjs`, `.github/`, `docs/`, `capstone/` | Lethu |

## More

See [docs/](docs/README.md) for the tech stack rules, setup, workflow and decisions.
