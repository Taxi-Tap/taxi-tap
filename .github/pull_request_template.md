Fixes TAX-

## What changed

## How I tested it
- [ ] `npm run check` passes
- [ ] Tried it in the browser (phone size if it's a screen)

## Checklist
- [ ] Screens only call server actions; no `db` imports outside `server/`
- [ ] Every new server action calls `requireUser()` / `requireRole()`
- [ ] Money only moves through `transfer()`; amounts in whole cents
- [ ] Schema changes made in `db/schema.ts` with a new file in `drizzle/`
- [ ] No secrets committed
