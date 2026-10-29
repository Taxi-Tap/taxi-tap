"use server";

// Customer payment code (TAX-41): a signed token shown as a QR, plus a short manual code.
// It expires after 60 seconds and works once; the reader consumes it in server/payments.ts.

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { qrTokens, transactions } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { issueQr } from "@/server/qr-helpers";
import { ensureWallet } from "@/server/wallet-helpers";
import type { ActionResult } from "@/lib/personal-types";

export type MyCode = { token: string; code: string; nonce: string; expiresAt: number };

export async function createQrToken(): Promise<ActionResult<{ qr: MyCode }>> {
  const { profile } = await requireRole("customer");
  const wallet = await ensureWallet("profile", profile.id);
  return { ok: true, qr: await issueQr(wallet.id) };
}

/** Has the code been scanned yet? Lets the customer screen show the result. */
export async function getQrStatus(nonce: string): Promise<{ used: boolean; txId?: string; failed?: string }> {
  const { profile } = await requireRole("customer");
  const wallet = await ensureWallet("profile", profile.id);
  const [row] = await db.select().from(qrTokens).where(and(eq(qrTokens.nonce, nonce), eq(qrTokens.walletId, wallet.id))).limit(1);
  if (!row?.usedAt) return { used: false };
  const [tx] = await db.select({ id: transactions.id, status: transactions.status, reason: transactions.failureReason }).from(transactions).where(eq(transactions.idempotencyKey, `qr:${nonce}`)).limit(1);
  if (!tx) return { used: true };
  return tx.status === "success" ? { used: true, txId: tx.id } : { used: true, txId: tx.id, failed: tx.reason ?? "Payment failed" };
}
