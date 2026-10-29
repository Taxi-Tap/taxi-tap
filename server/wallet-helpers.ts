// Helpers shared by the customer server actions. Not a "use server" file on purpose:
// these take arbitrary ids and must never be callable from the browser.

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { notifications, organisations, profiles, wallets } from "@/db/schema";

const SYSTEM_FUNDS_NAME = "Demo funds (system)";
const SYSTEM_FUNDS_CENTS = 2_000_000_000;

export type WalletRow = typeof wallets.$inferSelect;

/** The wallet of a profile, created on first use. */
export async function ensureWallet(
  ownerType: "profile" | "organisation",
  ownerId: string,
): Promise<WalletRow> {
  await db.insert(wallets).values({ ownerType, ownerId }).onConflictDoNothing();
  const [wallet] = await db
    .select()
    .from(wallets)
    .where(and(eq(wallets.ownerType, ownerType), eq(wallets.ownerId, ownerId)))
    .limit(1);
  if (!wallet) throw new Error("Could not load wallet");
  return wallet;
}

export async function systemFundsWallet(): Promise<WalletRow> {
  const [existing] = await db
    .select({ id: organisations.id })
    .from(organisations)
    .where(eq(organisations.name, SYSTEM_FUNDS_NAME))
    .limit(1);
  let orgId = existing?.id;
  if (!orgId) {
    const [created] = await db
      .insert(organisations)
      .values({ name: SYSTEM_FUNDS_NAME, type: "business" })
      .returning({ id: organisations.id });
    orgId = created.id;
  }
  const wallet = await ensureWallet("organisation", orgId);
  if (wallet.balanceCents === 0) {
    await db.update(wallets).set({ balanceCents: SYSTEM_FUNDS_CENTS }).where(eq(wallets.id, wallet.id));
  }
  return wallet;
}

/** Display names for wallets (profile name or organisation name). */
export async function walletNames(ids: string[]) {
  const names = new Map<string, string>();
  if (ids.length === 0) return names;
  const rows = await db.select().from(wallets).where(inArray(wallets.id, ids));
  const profileIds = rows.filter((w) => w.ownerType === "profile").map((w) => w.ownerId);
  const orgIds = rows.filter((w) => w.ownerType === "organisation").map((w) => w.ownerId);
  const [profileRows, orgRows] = await Promise.all([
    profileIds.length ? db.select({ id: profiles.id, name: profiles.name }).from(profiles).where(inArray(profiles.id, profileIds)) : [],
    orgIds.length ? db.select({ id: organisations.id, name: organisations.name }).from(organisations).where(inArray(organisations.id, orgIds)) : [],
  ]);
  const byOwner = new Map([...profileRows, ...orgRows].map((r) => [r.id, r.name]));
  for (const w of rows) names.set(w.id, byOwner.get(w.ownerId) ?? "Taxi Tap");
  return names;
}


export async function notify(
  profileId: string,
  kind: "payment" | "topup" | "receipt" | "security" | "promo",
  title: string,
  body: string,
) {
  await db.insert(notifications).values({ profileId, kind, title, body });
}
