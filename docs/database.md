# Database: schema and migrations

Source of truth: [`db/schema.ts`](../db/schema.ts) (app tables) and [`db/auth-schema.ts`](../db/auth-schema.ts) (BetterAuth tables). SQL history: [`drizzle/`](../drizzle). Change either file, then `npm run db:generate` and commit the new SQL file with its `meta/` snapshot.

Which branch has what (checked when this page was last updated):

| Branch | Migrations in `drizzle/` | Notes |
| --- | --- | --- |
| `main` | `0000` | Behind: only the BetterAuth tables. Takes `dev` at release time. |
| `dev` | `0000` to `0004` | Full schema. Work happens here. |

## Migration history

| File | What it does | Linear |
| --- | --- | --- |
| `0000_better_auth_tables.sql` | BetterAuth tables: `user`, `session`, `account`, `verification` | TAX-31 |
| `0001_flawless_sleepwalker.sql` | The 12 app tables, enums, foreign keys, wallet and payment constraints | TAX-89 |
| `0002_loud_silk_fever.sql` | `transactions.amount_cents` nullable, `requested_amount` for failed attempts (reliability test) | TAX-66 |
| `0003_auth_2fa_and_org_join.sql` | `two_factor` table, `user.two_factor_enabled`, `organisations.slug` / `logo_url` / `location` / `join_code` | TAX-32, TAX-34 |
| `0004_personal_account.sql` | `notifications` table, `notification_kind` enum, `tx_kind` gains `transfer`, `transactions.note`, `profiles.sms_alerts` / `promotions` / `language` | TAX-39, TAX-54 |

Apply with `npm run db:migrate` against your own Neon branch. The tests in `tests/ledger.test.ts` and `tests/reliability.test.ts` use that branch, so **they fail until the latest migration is applied**.

## Tables

### BetterAuth (`db/auth-schema.ts`, generated; do not hand-edit beyond plugin fields)

| Table | Purpose |
| --- | --- |
| `user` | Login identity: email, name, `email_verified`, `two_factor_enabled` |
| `session` | Signed-in browser sessions |
| `account` | Credential (password hash) or Google link per user |
| `verification` | Tokens for email verification, password reset and emailed codes |
| `two_factor` | Per-user two-factor secret and recovery codes (`two-factor` plugin). Codes are emailed, no authenticator app |

### App tables (`db/schema.ts`)

| Table | Purpose | Key columns |
| --- | --- | --- |
| `profiles` | The app's view of a user: role, phone and Settings toggles | `auth_user_id` (unique, FK `user`), `role`, `phone`, `sms_alerts`, `promotions`, `language` |
| `organisations` | Association, taxi business or merchant | `type`, `association_id` (self FK), `slug` (unique), `logo_url`, `location`, `join_code` (unique) |
| `memberships` | Which profile belongs to which organisation | unique (`profile_id`, `organisation_id`), `role` |
| `stalls` | Merchant stalls | `owner_org_id` |
| `routes` | Fare routes | `association_id`, `fare_model` (`flat` / `ladder`) |
| `fare_bands` | Prices on a route | `amount_cents > 0` |
| `vehicles` | Taxis | `registration` (unique), `owner_org_id`, `route_id` |
| `trips` | A driver's trip on a route | `vehicle_id`, `driver_id`, `route_id` |
| `wallets` | One per profile or organisation | unique (`owner_type`, `owner_id`), `balance_cents >= 0` |
| `transactions` | Every payment attempt | `idempotency_key` (unique), `kind` (`fare`, `topup`, `merchant`, `transfer`), `status`, `note`, `staff_id`, `latitude` / `longitude` |
| `notifications` | Per-profile inbox: payment received, recharge, receipt ready, security, promo | `profile_id`, `kind`, `read_at` |
| `qr_tokens` | Short-lived signed QR payloads | `nonce` (unique), `expires_at`, `used_at` |
| `nfc_tags` | NFC tag to wallet | `serial` (unique), `active` |

Roles (`role` enum): `customer`, `driver`, `owner`, `association_admin`, `merchant_staff`. Organisation types (`org_type`): `association`, `business`, `merchant`. All money is whole cents.

## How sign-up fills these tables

All three paths call BetterAuth to create the `user`, then write the rest in **one** `db.transaction` (`server/signup.ts`). If that second step fails the new `user` is deleted so the email can be reused.

| Screen path | `profiles.role` | Also creates |
| --- | --- | --- |
| Personal (`/sign-up`) | `customer` | nothing else (wallet is created on first use) |
| Business, create company (`/sign-up?type=business`) | `association_admin` / `owner` / `merchant_staff` by company type | `organisations` row with a random 9-character `join_code`, owner `memberships` row, organisation `wallets` row |
| Business, join company | `driver` or `merchant_staff` (the job role picked) | `memberships` row for the company that owns the code |

A Google sign-in with no profile gets a `customer` profile on first load (`ensureProfile` in `server/auth.ts`).

## Personal account screens and the data they use

| Screens | Server actions | Tables |
| --- | --- | --- |
| Wallet, Recharge | `getWalletSummary`, `rechargeWallet` (`server/wallets.ts`) | `wallets`, `transactions` (kind `topup`, from the "Demo funds (system)" wallet) |
| Send, Transfer | `lookupRecipient`, `sendMoney`, `listRecentRecipients` | `transactions` (kind `transfer`), `notifications` |
| History, Receipt | `listMyTransactions`, `getReceipt` | `transactions`, `fare_bands` |
| Home search, Pay, Confirm, Success | `listDestinations`, `simulateReader`, `payReader` (`server/pay.ts`) | `routes`, `fare_bands`, `organisations`, `transactions` (kind `fare` or `merchant`) |
| Profile, Settings, Notifications, Help | `getAccount`, `updateSettings`, `changePassword`, `listNotifications` | `profiles`, `notifications`, BetterAuth tables |

Fares are priced by the server from `fare_bands`, never from the browser. Helpers that take arbitrary ids live in `server/wallet-helpers.ts`, which is not a `"use server"` file, so the browser cannot call them.

## Known gaps

- One wallet per person: the Transfer screen sends to a previous recipient instead of moving money between two of your own cards.
- Tap and QR scan call `simulateReader`; the camera and the signed QR / NFC tag handshake are not wired (TAX-43, `server/qr.ts`, `server/payments.ts`).
- Home and Receipt use `components/maps/google-map.tsx`: the real map when `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set (it must be named exactly that on Vercel, and is read at build time), a drawn street grid otherwise. Route and payment pins for owners are TAX-68.

- `join_code` gives immediate access: there is no admin approval step yet. Add a pending status on `memberships` with the TAX-34 actions.
- `logo_url` holds a small (128 px) data URL, not a file in storage.
- `server/organisations.ts` and the vehicle/stall actions (TAX-34, TAX-35) are still stubs; nothing lists or edits companies after sign-up.
- Contact-number two-factor (SMS) is not built; codes go to email only.
