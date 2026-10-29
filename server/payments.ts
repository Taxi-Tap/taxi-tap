"use server";

// Payment API (TAX-44): a driver or merchant reads a customer's code, the server checks it,
// prices the payment, and moves the money through transfer() with an idempotency key.
//
// The amount never comes from the customer's phone: a fare is priced from the fare band,
// a merchant sale from what the staff member typed. The customer's code is single use and
// the transfer key is `qr:<nonce>`, so a repeat scan cannot charge twice.

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { wallets } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { transfer } from "@/server/ledger";
import { consumeQr } from "@/server/qr-helpers";
import { fareContext } from "@/server/trip-helpers";
import { ensureWallet, notify } from "@/server/wallet-helpers";
import { memberOrg } from "@/server/work-helpers";
import { formatCents } from "@/lib/money";
import type { ActionResult } from "@/lib/personal-types";

type Where = { latitude?: number; longitude?: number };

async function tellCustomer(walletId: string, text: string) {
  const [w] = await db.select().from(wallets).where(eq(wallets.id, walletId)).limit(1);
  if (w?.ownerType === "profile") await notify(w.ownerId, "receipt", "Payment sent", text);
}

/** Driver: charge `quantity` passengers going to `bandId` using a customer's code. */
export async function payFare(input: { credential: string; bandId: string; quantity: number } & Where): Promise<
  ActionResult<{ amountCents: number }>
> {
  const { profile } = await requireRole("driver");
  const ctx = await fareContext(profile.id, input.bandId, input.quantity);
  if (!ctx.ok) return ctx;

  const code = await consumeQr(input.credential);
  if (!code.ok) return { ok: false, error: code.error };

  const ownerWallet = await ensureWallet("organisation", ctx.vehicle.ownerOrgId);
  const tx = await transfer({
    fromId: code.walletId,
    toId: ownerWallet.id,
    amountCents: ctx.amountCents,
    kind: "fare",
    method: "qr",
    key: `qr:${code.nonce}`,
    tripId: ctx.trip.id,
    fareBandId: ctx.band.id,
    staffId: profile.id,
    qty: input.quantity,
    latitude: input.latitude,
    longitude: input.longitude,
  });
  if (tx.status !== "success") return { ok: false, error: tx.failureReason ?? "Payment failed" };
  await tellCustomer(code.walletId, `${formatCents(ctx.amountCents)} taxi fare`);
  return { ok: true, amountCents: ctx.amountCents };
}

/** Merchant staff: take `amountCents` from a customer's code. */
export async function payMerchant(input: { credential: string; amountCents: number } & Where): Promise<ActionResult<{ amountCents: number }>> {
  const { profile } = await requireRole("merchant_staff");
  const org = await memberOrg(profile.id);
  if (!org) return { ok: false, error: "You are not part of a company yet." };
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents < 100 || input.amountCents > 1_000_000) {
    return { ok: false, error: "Enter an amount between R1.00 and R10 000.00." };
  }

  const code = await consumeQr(input.credential);
  if (!code.ok) return { ok: false, error: code.error };

  const shopWallet = await ensureWallet("organisation", org.id);
  const tx = await transfer({
    fromId: code.walletId,
    toId: shopWallet.id,
    amountCents: input.amountCents,
    kind: "merchant",
    method: "qr",
    key: `qr:${code.nonce}`,
    staffId: profile.id,
    latitude: input.latitude,
    longitude: input.longitude,
  });
  if (tx.status !== "success") return { ok: false, error: tx.failureReason ?? "Payment failed" };
  await tellCustomer(code.walletId, `${formatCents(input.amountCents)} at ${org.name}`);
  return { ok: true, amountCents: input.amountCents };
}
