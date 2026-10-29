"use server";

// Customer wallet: balance, history, receipt, simulated recharge, send money (TAX-36, TAX-37, TAX-39).
// Every action starts with requireRole("customer"). Money only moves through transfer().

import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { fareBands, organisations, profiles, transactions, wallets } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { transfer } from "@/server/ledger";
import { ensureWallet, notify, systemFundsWallet, walletNames, type WalletRow } from "@/server/wallet-helpers";
import { formatCents, randsToCents } from "@/lib/money";
import type { ActionResult, TxCategory, TxView, WalletSummary } from "@/lib/personal-types";

const MAX_RECHARGE_CENTS = 500_000;

function toSummary(wallet: WalletRow): WalletSummary {
  return {
    walletId: wallet.id,
    balanceCents: wallet.balanceCents,
    cardLast4: wallet.id.replace(/\D/g, "").padEnd(4, "0").slice(0, 4),
  };
}

export async function getWalletSummary(): Promise<WalletSummary> {
  const { profile } = await requireRole("customer");
  return toSummary(await ensureWallet("profile", profile.id));
}

const CATEGORY: Record<string, TxCategory> = {
  fare: "taxi",
  merchant: "stall",
  topup: "recharge",
  transfer: "transfer",
};

async function toViews(rows: (typeof transactions.$inferSelect)[], myWalletId: string): Promise<TxView[]> {
  const names = await walletNames([...new Set(rows.flatMap((r) => [r.fromWalletId, r.toWalletId]))]);
  const bandIds = rows.flatMap((r) => (r.fareBandId ? [r.fareBandId] : []));
  const bands = bandIds.length
    ? await db.select({ id: fareBands.id, label: fareBands.label }).from(fareBands).where(inArray(fareBands.id, bandIds))
    : [];
  const bandLabel = new Map(bands.map((b) => [b.id, b.label]));

  return rows.map((r) => {
    const direction = r.toWalletId === myWalletId ? "in" : "out";
    const counterparty = names.get(direction === "in" ? r.fromWalletId : r.toWalletId) ?? "Taxi Tap";
    let title = counterparty;
    let subtitle = "";
    if (r.kind === "fare") {
      title = "Taxi fare";
      subtitle = (r.fareBandId && bandLabel.get(r.fareBandId)) || counterparty;
    } else if (r.kind === "topup") {
      title = "Recharge";
      subtitle = "Demo funds";
    } else if (r.kind === "transfer") {
      title = direction === "in" ? `Received from ${counterparty}` : `Sent to ${counterparty}`;
      subtitle = r.note ?? "";
    }
    return {
      id: r.id,
      direction,
      amountCents: r.amountCents ?? 0,
      category: CATEGORY[r.kind] ?? "transfer",
      title,
      subtitle,
      status: r.status,
      failureReason: r.failureReason,
      method: r.method,
      counterparty,
      reference: `TT-${r.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`,
      location: r.latitude && r.longitude ? `${Number(r.latitude).toFixed(3)}, ${Number(r.longitude).toFixed(3)}` : null,
      createdAt: r.createdAt.toISOString(),
    };
  });
}

/** Newest first. `limit` is for the short list on the wallet screen. */
export async function listMyTransactions(limit = 100): Promise<TxView[]> {
  const { profile } = await requireRole("customer");
  const wallet = await ensureWallet("profile", profile.id);
  const rows = await db
    .select()
    .from(transactions)
    .where(or(eq(transactions.fromWalletId, wallet.id), eq(transactions.toWalletId, wallet.id)))
    .orderBy(desc(transactions.createdAt))
    .limit(Math.min(limit, 200));
  return toViews(rows, wallet.id);
}

export async function getReceipt(id: string): Promise<TxView | null> {
  const { profile } = await requireRole("customer");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const wallet = await ensureWallet("profile", profile.id);
  const [row] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), or(eq(transactions.fromWalletId, wallet.id), eq(transactions.toWalletId, wallet.id))))
    .limit(1);
  return row ? (await toViews([row], wallet.id))[0] : null;
}

/** Simulated recharge: moves demo funds from the system wallet. `key` makes a double tap harmless. */
export async function rechargeWallet(input: { amountCents: number; key?: string }): Promise<ActionResult<{ txId: string }>> {
  const { profile } = await requireRole("customer");
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents < 100 || input.amountCents > MAX_RECHARGE_CENTS) {
    return { ok: false, error: `Enter an amount between R1.00 and ${formatCents(MAX_RECHARGE_CENTS)}.` };
  }
  const [mine, funds] = await Promise.all([ensureWallet("profile", profile.id), systemFundsWallet()]);
  const tx = await transfer({
    fromId: funds.id,
    toId: mine.id,
    amountCents: input.amountCents,
    kind: "topup",
    method: "simulated",
    key: input.key ?? randomUUID(),
  });
  if (tx.status !== "success") return { ok: false, error: tx.failureReason ?? "Recharge failed" };
  await notify(profile.id, "topup", "Wallet recharged", `${formatCents(input.amountCents)} top up via sim`);
  return { ok: true, txId: tx.id };
}

/** Find another customer by email or phone number. */
async function findRecipient(to: string) {
  const value = to.trim();
  if (!value) return null;
  if (value.includes("@")) {
    const [row] = await db
      .select({ id: profiles.id, name: profiles.name })
      .from(profiles)
      .innerJoin(user, eq(user.id, profiles.authUserId))
      .where(eq(user.email, value.toLowerCase()))
      .limit(1);
    return row ?? null;
  }
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7) return null;
  const [row] = await db
    .select({ id: profiles.id, name: profiles.name })
    .from(profiles)
    .where(sql`regexp_replace(${profiles.phone}, '\\D', '', 'g') = ${digits}`)
    .limit(1);
  return row ?? null;
}

export async function lookupRecipient(to: string): Promise<ActionResult<{ name: string }>> {
  const { profile } = await requireRole("customer");
  const found = await findRecipient(to);
  if (!found) return { ok: false, error: "We could not find a Taxi Tap account for that email or number." };
  if (found.id === profile.id) return { ok: false, error: "You cannot send money to yourself." };
  return { ok: true, name: found.name };
}

export async function sendMoney(input: { to: string; amountCents: number; note?: string; key?: string }): Promise<ActionResult<{ txId: string }>> {
  const { profile } = await requireRole("customer");
  const found = await findRecipient(input.to);
  if (!found) return { ok: false, error: "We could not find a Taxi Tap account for that email or number." };
  if (found.id === profile.id) return { ok: false, error: "You cannot send money to yourself." };
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents < 100) {
    return { ok: false, error: "Enter an amount of at least R1.00." };
  }
  const [mine, theirs] = await Promise.all([ensureWallet("profile", profile.id), ensureWallet("profile", found.id)]);
  const tx = await transfer({
    fromId: mine.id,
    toId: theirs.id,
    amountCents: input.amountCents,
    kind: "transfer",
    method: "simulated",
    key: input.key ?? randomUUID(),
  });
  if (tx.status !== "success") return { ok: false, error: tx.failureReason ?? "Transfer failed" };
  const note = input.note?.trim().slice(0, 100);
  if (note) await db.update(transactions).set({ note }).where(eq(transactions.id, tx.id));
  await notify(found.id, "payment", "Payment received", `${formatCents(input.amountCents)} from ${profile.name}`);
  return { ok: true, txId: tx.id };
}

/** People you have sent money to before (for the Transfer screen). */
export async function listRecentRecipients(): Promise<{ name: string; to: string }[]> {
  const { profile } = await requireRole("customer");
  const mine = await ensureWallet("profile", profile.id);
  const rows = await db
    .select({ toWalletId: transactions.toWalletId })
    .from(transactions)
    .where(and(eq(transactions.fromWalletId, mine.id), eq(transactions.kind, "transfer"), eq(transactions.status, "success")))
    .orderBy(desc(transactions.createdAt))
    .limit(20);
  const ids = [...new Set(rows.map((r) => r.toWalletId))].slice(0, 5);
  if (ids.length === 0) return [];
  const found = await db
    .select({ name: profiles.name, email: user.email })
    .from(wallets)
    .innerJoin(profiles, eq(profiles.id, wallets.ownerId))
    .innerJoin(user, eq(user.id, profiles.authUserId))
    .where(and(inArray(wallets.id, ids), eq(wallets.ownerType, "profile")));
  return found.map((f) => ({ name: f.name, to: f.email }));
}
