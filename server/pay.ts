"use server";

// Customer-side payment: pick a destination (TAX-54), simulate a reader tap/scan, confirm and pay.
// The real reader handshake (signed QR token, NFC tag lookup) belongs to payments.ts / qr.ts;
// until those exist, simulateReader stands in for the reader and payReader goes through transfer().

import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { fareBands, organisations, paymentRequests, routes, wallets } from "@/db/schema";
import { settleRequest } from "@/server/payment-requests";
import { requireRole } from "@/server/auth";
import { transfer } from "@/server/ledger";
import { ensureWallet, notify } from "@/server/wallet-helpers";
import { formatCents } from "@/lib/money";
import type { ActionResult, Destination, ReaderQuote } from "@/lib/personal-types";

const DEFAULT_SHOP_CENTS = 5000;
const MAX_TIP_CENTS = 50_000;

/** Taxi: every fare band on every route. Shop: merchants. */
export async function listDestinations(mode: "taxi" | "shop"): Promise<Destination[]> {
  await requireRole("customer");
  if (mode === "shop") {
    const rows = await db
      .select({ id: organisations.id, name: organisations.name, location: organisations.location })
      .from(organisations)
      .where(eq(organisations.type, "merchant"))
      .orderBy(asc(organisations.name));
    return rows.map((o) => ({ id: o.id, title: o.name, subtitle: o.location ?? "Merchant" }));
  }
  const rows = await db
    .select({ id: fareBands.id, label: fareBands.label, amountCents: fareBands.amountCents, route: routes.name })
    .from(fareBands)
    .innerJoin(routes, eq(routes.id, fareBands.routeId))
    .orderBy(asc(routes.name), asc(fareBands.sortOrder));
  return rows.map((b) => ({ id: b.id, title: b.label, subtitle: `${b.route} · ${formatCents(b.amountCents)}`, amountCents: b.amountCents }));
}

/** Stand-in for the reader: says who gets paid and how much. */
export async function simulateReader(input: { bandId?: string; shopId?: string }): Promise<ActionResult<{ quote: ReaderQuote }>> {
  await requireRole("customer");
  if (input.bandId) {
    const [band] = await db
      .select({ id: fareBands.id, label: fareBands.label, amountCents: fareBands.amountCents, associationId: routes.associationId })
      .from(fareBands)
      .innerJoin(routes, eq(routes.id, fareBands.routeId))
      .where(eq(fareBands.id, input.bandId))
      .limit(1);
    if (!band) return { ok: false, error: "That destination is no longer available." };
    const [org] = await db.select({ name: organisations.name }).from(organisations).where(eq(organisations.id, band.associationId)).limit(1);
    const wallet = await ensureWallet("organisation", band.associationId);
    return { ok: true, quote: { payeeWalletId: wallet.id, payeeName: org?.name ?? "Taxi", amountCents: band.amountCents, label: band.label, bandId: band.id } };
  }
  const [merchant] = input.shopId
    ? await db.select().from(organisations).where(eq(organisations.id, input.shopId)).limit(1)
    : await db.select().from(organisations).where(eq(organisations.type, "merchant")).orderBy(asc(organisations.name)).limit(1);
  if (!merchant || merchant.type !== "merchant") return { ok: false, error: "No shop is available to pay yet." };
  const wallet = await ensureWallet("organisation", merchant.id);
  return { ok: true, quote: { payeeWalletId: wallet.id, payeeName: merchant.name, amountCents: DEFAULT_SHOP_CENTS, label: merchant.name } };
}

/** Customer enters a merchant code. Returns what they would pay. */
export async function lookupPaymentCode(code: string): Promise<ActionResult<{ requestId: string; company: string; amountCents: number }>> {
  await requireRole("customer");
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (clean.length !== 6) return { ok: false, error: "Enter all 6 characters of the code." };
  const [req] = await db.select().from(paymentRequests).where(eq(paymentRequests.code, clean)).limit(1);
  if (!req || req.status !== "pending" || req.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "That code is not valid. It may have expired or already been paid." };
  }
  const [org] = await db.select({ name: organisations.name }).from(organisations).where(eq(organisations.id, req.organisationId)).limit(1);
  return { ok: true, requestId: req.id, company: org?.name ?? "Merchant", amountCents: req.amountCents };
}

export async function payReader(input: {
  method: "qr" | "nfc";
  /** Pay a merchant request: amount and payee come from the request, not from the browser. */
  requestId?: string;
  payeeWalletId: string;
  bandId?: string;
  amountCents: number;
  tipCents?: number;
  key?: string;
}): Promise<ActionResult<{ txId: string }>> {
  const { profile } = await requireRole("customer");
  if (input.requestId) {
    const mine = await ensureWallet("profile", profile.id);
    const r = await settleRequest({ requestId: input.requestId, payerWalletId: mine.id, method: input.method });
    if (!r.ok) return { ok: false, error: r.error };
    await notify(profile.id, "receipt", "Trip receipt ready", `${formatCents(r.amountCents)} payment completed`);
    return { ok: true, txId: r.txId };
  }
  const tip = input.tipCents ?? 0;
  if (!Number.isSafeInteger(tip) || tip < 0 || tip > MAX_TIP_CENTS) return { ok: false, error: "Enter a valid tip." };

  // A fare is priced by the server from the fare band, never from the browser.
  let amountCents = input.amountCents;
  if (input.bandId) {
    const [band] = await db.select({ amountCents: fareBands.amountCents }).from(fareBands).where(eq(fareBands.id, input.bandId)).limit(1);
    if (!band) return { ok: false, error: "That fare is no longer available." };
    amountCents = band.amountCents;
  }
  if (!Number.isSafeInteger(amountCents) || amountCents <= 0) return { ok: false, error: "Invalid amount." };

  if (!input.bandId) {
    // Without a fare band the payee must be a merchant wallet.
    const [payee] = await db
      .select({ type: organisations.type })
      .from(wallets)
      .innerJoin(organisations, eq(organisations.id, wallets.ownerId))
      .where(and(eq(wallets.id, input.payeeWalletId), eq(wallets.ownerType, "organisation")))
      .limit(1);
    if (payee?.type !== "merchant") return { ok: false, error: "That payee cannot be paid here." };
  }

  const mine = await ensureWallet("profile", profile.id);
  const tx = await transfer({
    fromId: mine.id,
    toId: input.payeeWalletId,
    amountCents: amountCents + tip,
    kind: input.bandId ? "fare" : "merchant",
    method: input.method,
    key: input.key ?? randomUUID(),
    fareBandId: input.bandId,
  });
  if (tx.status !== "success") return { ok: false, error: tx.failureReason ?? "Payment failed" };
  await notify(profile.id, "receipt", "Trip receipt ready", `${formatCents(amountCents + tip)} payment completed`);
  return { ok: true, txId: tx.id };
}
