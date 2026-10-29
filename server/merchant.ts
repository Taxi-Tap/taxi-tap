"use server";

// Merchant side: ask a customer for an amount (a short code), watch it get paid, see sales.

import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { paymentRequests, profiles, transactions } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { newRequestCode } from "@/server/join-code";
import { settleRequest } from "@/server/payment-requests";
import { ensureWallet, systemFundsWallet } from "@/server/wallet-helpers";
import { memberOrg, startOfToday } from "@/server/work-helpers";
import { dayLabel, timeLabel } from "@/lib/format";
import type { ActionResult } from "@/lib/personal-types";
import type { PaymentRequestView, SaleView, ShopHome } from "@/lib/work-types";

const REQUEST_MINUTES = 10;
const MAX_REQUEST_CENTS = 1_000_000;

async function shop() {
  const { profile } = await requireRole("merchant_staff");
  const org = await memberOrg(profile.id);
  return { profile, org };
}

async function loadSales(orgId: string, since?: Date, limit = 50): Promise<SaleView[]> {
  const wallet = await ensureWallet("organisation", orgId);
  const rows = await db
    .select({ tx: transactions, by: profiles.name })
    .from(transactions)
    .leftJoin(profiles, eq(profiles.id, transactions.staffId))
    .where(
      and(
        eq(transactions.toWalletId, wallet.id),
        eq(transactions.status, "success"),
        since ? gte(transactions.createdAt, since) : undefined,
      ),
    )
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
  return rows.map((r) => ({
    id: r.tx.id,
    time: timeLabel(r.tx.createdAt.toISOString()),
    day: dayLabel(r.tx.createdAt.toISOString()),
    title: "Payment received",
    amountCents: r.tx.amountCents ?? 0,
    by: r.by ?? "Customer",
  }));
}

export async function getShopHome(): Promise<ShopHome> {
  const { org } = await shop();
  if (!org) return { company: "No company yet", todayCents: 0, salesToday: 0, recent: [] };
  const today = await loadSales(org.id, startOfToday(), 200);
  return {
    company: org.name,
    todayCents: today.reduce((s, t) => s + t.amountCents, 0),
    salesToday: today.length,
    recent: today.slice(0, 5),
  };
}

export async function listSales(): Promise<SaleView[]> {
  const { org } = await shop();
  return org ? loadSales(org.id, undefined, 100) : [];
}

function view(r: typeof paymentRequests.$inferSelect, company: string): PaymentRequestView {
  const expired = r.status === "pending" && r.expiresAt.getTime() < Date.now();
  return { id: r.id, code: r.code, amountCents: r.amountCents, status: expired ? "expired" : r.status, expiresAt: r.expiresAt.toISOString(), company };
}

export async function createPaymentRequest(amountCents: number): Promise<ActionResult<{ request: PaymentRequestView }>> {
  const { profile, org } = await shop();
  if (!org) return { ok: false, error: "You are not part of a company yet." };
  if (!Number.isSafeInteger(amountCents) || amountCents < 100 || amountCents > MAX_REQUEST_CENTS) {
    return { ok: false, error: "Enter an amount between R1.00 and R10 000.00." };
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const [row] = await db
      .insert(paymentRequests)
      .values({
        organisationId: org.id,
        staffId: profile.id,
        amountCents,
        code: newRequestCode(),
        expiresAt: new Date(Date.now() + REQUEST_MINUTES * 60_000),
      })
      .onConflictDoNothing({ target: paymentRequests.code })
      .returning();
    if (row) return { ok: true, request: view(row, org.name) };
  }
  return { ok: false, error: "Could not make a code. Please try again." };
}

export async function getPaymentRequest(id: string): Promise<PaymentRequestView | null> {
  const { org } = await shop();
  if (!org || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db.select().from(paymentRequests).where(and(eq(paymentRequests.id, id), eq(paymentRequests.organisationId, org.id))).limit(1);
  return row ? view(row, org.name) : null;
}

export async function cancelPaymentRequest(id: string): Promise<ActionResult> {
  const { org } = await shop();
  if (!org) return { ok: false, error: "You are not part of a company yet." };
  await db
    .update(paymentRequests)
    .set({ status: "cancelled" })
    .where(and(eq(paymentRequests.id, id), eq(paymentRequests.organisationId, org.id), eq(paymentRequests.status, "pending")));
  return { ok: true };
}

/** Demo only: pays a request from the "Demo funds (system)" wallet, standing in for a customer. */
export async function simulateCustomerPays(id: string): Promise<ActionResult> {
  const { org } = await shop();
  if (!org) return { ok: false, error: "You are not part of a company yet." };
  const [row] = await db.select({ id: paymentRequests.id }).from(paymentRequests).where(and(eq(paymentRequests.id, id), eq(paymentRequests.organisationId, org.id))).limit(1);
  if (!row) return { ok: false, error: "That request was not found." };
  const payer = await systemFundsWallet();
  const r = await settleRequest({ requestId: id, payerWalletId: payer.id, method: "simulated" });
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}
