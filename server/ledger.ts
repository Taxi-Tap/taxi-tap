import { asc, and, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions, wallets } from "@/db/schema";

export type TransferInput = {
  fromId: string;
  toId: string;
  amountCents: number;
  kind: "fare" | "topup" | "merchant" | "transfer";
  method: "qr" | "nfc" | "simulated";
  key: string;
  tripId?: string;
  fareBandId?: string;
  staffId?: string;
  qty?: number;
  latitude?: number;
  longitude?: number;
};

type TransactionRow = typeof transactions.$inferSelect;

async function findTransactionByKey(key: string): Promise<TransactionRow | null> {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.idempotencyKey, key))
    .limit(1);
  return transaction ?? null;
}

async function recordFailure(
  input: TransferInput,
  failureReason: string,
  invalidAmount = false,
): Promise<TransactionRow> {
  const [transaction] = await db
    .insert(transactions)
    .values({
      fromWalletId: input.fromId,
      toWalletId: input.toId,
      amountCents: invalidAmount ? null : input.amountCents,
      requestedAmount: invalidAmount ? String(input.amountCents) : null,
      kind: input.kind,
      method: input.method,
      status: "failed",
      failureReason,
      quantity: input.qty ?? 1,
      tripId: input.tripId,
      fareBandId: input.fareBandId,
      staffId: input.staffId,
      latitude: input.latitude === undefined ? undefined : String(input.latitude),
      longitude:
        input.longitude === undefined ? undefined : String(input.longitude),
      idempotencyKey: input.key,
    })
    .onConflictDoNothing({ target: transactions.idempotencyKey })
    .returning();

  if (transaction) return transaction;

  const existing = await findTransactionByKey(input.key);
  if (existing) return existing;

  throw new Error("Unable to record failed payment");
}

export async function transfer(input: TransferInput): Promise<TransactionRow> {
  const existing = await findTransactionByKey(input.key);
  if (existing) return existing;

  const invalidAmount =
    !Number.isSafeInteger(input.amountCents) || input.amountCents <= 0;
  if (invalidAmount || input.fromId === input.toId) {
    return recordFailure(input, "Invalid amount", invalidAmount);
  }

  try {
    return await db.transaction(async (tx) => {
      const lockedWallets = await tx
        .select({ id: wallets.id })
        .from(wallets)
        .where(inArray(wallets.id, [input.fromId, input.toId]))
        .orderBy(asc(wallets.id))
        .for("update");

      if (lockedWallets.length !== 2) {
        throw new Error("Payment failed");
      }

      const [debitedWallet] = await tx
        .update(wallets)
        .set({
          balanceCents: sql`${wallets.balanceCents} - ${input.amountCents}`,
        })
        .where(
          and(
            eq(wallets.id, input.fromId),
            gte(wallets.balanceCents, input.amountCents),
          ),
        )
        .returning({ id: wallets.id });

      if (!debitedWallet) {
        throw new Error("INSUFFICIENT");
      }

      const [creditedWallet] = await tx
        .update(wallets)
        .set({
          balanceCents: sql`${wallets.balanceCents} + ${input.amountCents}`,
        })
        .where(eq(wallets.id, input.toId))
        .returning({ id: wallets.id });

      if (!creditedWallet) {
        throw new Error("Payment failed");
      }

      const [transaction] = await tx
        .insert(transactions)
        .values({
          fromWalletId: input.fromId,
          toWalletId: input.toId,
          amountCents: input.amountCents,
          kind: input.kind,
          method: input.method,
          status: "success",
          quantity: input.qty ?? 1,
          tripId: input.tripId,
          fareBandId: input.fareBandId,
          staffId: input.staffId,
          latitude:
            input.latitude === undefined ? undefined : String(input.latitude),
          longitude:
            input.longitude === undefined ? undefined : String(input.longitude),
          idempotencyKey: input.key,
        })
        .returning();

      if (!transaction) {
        throw new Error("Payment failed");
      }

      return transaction;
    });
  } catch (error) {
    const failureReason =
      error instanceof Error && error.message === "INSUFFICIENT"
        ? "Insufficient balance"
        : "Payment failed";
    return recordFailure(input, failureReason);
  }
}
