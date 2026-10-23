# docs

| File | What it is |
| --- | --- |
| [tech-stack.md](tech-stack.md) | The stack and the boundary rules every PR must follow |
| [setup.md](setup.md) | Getting a laptop ready (Node 22, Neon branch, `npm run setup`) |
| [workflow.md](workflow.md) | Linear → branch → PR → merge rules, branches and release tags |
| [decisions/0001-neon-drizzle-no-docker.md](decisions/0001-neon-drizzle-no-docker.md) | Why Neon + Drizzle and no Docker |
| [Group4_TaxiTap_Tech_Stack.pdf](Group4_TaxiTap_Tech_Stack.pdf) | Full write-up: Tech Stack and Project Structure |
| [erd/](erd/) | ERD image (Chris, TAX-89) |
| [diagrams/](diagrams/) | Other diagrams |

## Folder owners

| Folder / file | Owner |
| --- | --- |
| `app/(auth)`, `app/(customer)`, `app/(merchant)` | Chris |
| `app/(reader)`, `components/qr`, `server/qr.ts` | Chris |
| `db/schema.ts`, `drizzle/` | Everyone (schema changes and migrations go through a PR); ERD: Chris |
| `components/nfc`, `lib/nfc.ts` | Londa |
| other `server/` actions, `scripts/seed.ts` | Londa |
| `app/(owner)`, `components/maps`, `components/ui` | Lethu |
| `server/auth.ts`, `scripts/setup.mjs`, `scripts/doctor.mjs`, `.github/`, `docs/`, `capstone/` | Lethu |
