# Workflow

## Branches

| Branch | Purpose |
| --- | --- |
| `main` | Released code only. Protected. Updated from `dev` at each release. |
| `dev` | Integration branch. Every feature PR goes here. |
| `feature/tax-xx-...` | One branch per Linear issue, cut from `dev`. |

## From issue to merge

1. Pick a Linear issue and move it to **In Progress**.
2. Branch from `dev` using Linear's branch name (copy it from the issue, e.g. `feature/tax-41-...`):
   `git switch dev && git pull && git switch -c feature/tax-41-...`
3. Make small commits that name the issue, e.g. `Add 60-second expiry to QR tokens (TAX-41)`.
4. Run `npm run check` before you push.
5. Open a PR **into `dev`** with `Fixes TAX-xx` in the description (the template fills this in).
6. Reviewer = the reviewer for the folder's owner (see [README.md](README.md)).
7. CI must be green. Then squash-merge into `dev` and move the issue to **Done**.

## Releases

At each release `dev` is merged into `main` with a PR, then tagged:

| Tag | Date |
| --- | --- |
| `v0.1` | 16 Oct |
| `v0.2` | 23 Oct |
| `v1.0` | 28 Oct |
