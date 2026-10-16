# Developer setup

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
