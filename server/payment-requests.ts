// Settling a merchant payment request. Shared by the customer (pays by code) and by the
// merchant's "simulate customer" button. Not a "use server" file: it takes arbitrary ids.

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentRequests } from "@/db/schema";
import { transfer } from "@/server/ledger";
import { ensureWallet } from "@/server/wallet-helpers";

export type SettleResult = { ok: true; txId: string; amountCents: number } | { ok: false; error: string };

export async function settleRequest(input: {
  requestId: string;
  payerWalletId: string;
  method: "qr" | "nfc" | "simulated";
}): Promise<SettleResult> {
  const [req] = await db.select().from(paymentRequests).where(eq(paymentRequests.id, input.requestId)).limit(1);
  if (!req) return { ok: false, error: "That payment request was not found." };
  if (req.status === "paid") return { ok: false, error: "That request has already been paid." };
  if (req.status !== "pending") return { ok: false, error: "That request was cancelled or has expired." };
  if (req.expiresAt.getTime() < Date.now()) {
    await db.update(paymentRequests).set({ status: "expired" }).where(and(eq(paymentRequests.id, req.id), eq(paymentRequests.status, "pending")));
    return { ok: false, error: "That request has expired. Ask for a new one." };
  }

  const merchantWallet = await ensureWallet("organisation", req.organisationId);
  // One key per request: a second attempt cannot charge again.
  const tx = await transfer({
    fromId: input.payerWalletId,
    toId: merchantWallet.id,
    amountCents: req.amountCents,
    kind: "merchant",
    method: input.method,
    key: `request:${req.id}`,
    staffId: req.staffId,
  });
  if (tx.status !== "success") return { ok: false, error: tx.failureReason ?? "Payment failed" };
  if (tx.fromWalletId !== input.payerWalletId) return { ok: false, error: "That request has already been paid." };

  await db
    .update(paymentRequests)
    .set({ status: "paid", transactionId: tx.id })
    .where(and(eq(paymentRequests.id, req.id), eq(paymentRequests.status, "pending")));
  return { ok: true, txId: tx.id, amountCents: req.amountCents };
}
