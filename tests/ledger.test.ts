import { existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { user } from "@/db/auth-schema";
import { profiles, transactions, wallets } from "@/db/schema";
import type { TransferInput } from "@/server/ledger";
import { and, eq, inArray, or } from "drizzle-orm";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

describe.skipIf(!process.env.DATABASE_URL)("transfer()", () => {
  let db: typeof import("@/db").db;
  let transfer: typeof import("@/server/ledger").transfer;
  const authUserIds: string[] = [];
  const walletIds: string[] = [];

  beforeAll(async () => {
    ({ db } = await import("@/db"));
    ({ transfer } = await import("@/server/ledger"));
  });

  afterEach(async () => {
    if (!db) return;

    if (walletIds.length > 0) {
      await db
        .delete(transactions)
        .where(
          or(
            inArray(transactions.fromWalletId, walletIds),
            inArray(transactions.toWalletId, walletIds),
          ),
        );
      await db.delete(wallets).where(inArray(wallets.id, walletIds));
    }

    if (authUserIds.length > 0) {
      await db.delete(user).where(inArray(user.id, authUserIds));
    }

    walletIds.length = 0;
    authUserIds.length = 0;
  });

  async function createWallet(balanceCents: number) {
    const authUserId = randomUUID();
    authUserIds.push(authUserId);
    await db.insert(user).values({
      id: authUserId,
      name: "Ledger test user",
      email: `${authUserId}@example.test`,
    });

    const [profile] = await db
      .insert(profiles)
      .values({ authUserId, name: "Ledger test user" })
      .returning();
    const [wallet] = await db
      .insert(wallets)
      .values({
        ownerType: "profile",
        ownerId: profile.id,
        balanceCents,
      })
      .returning();
    walletIds.push(wallet.id);
    return wallet;
  }

  function paymentInput(
    fromId: string,
    toId: string,
    key = randomUUID(),
    amountCents = 100,
  ): TransferInput {
    return {
      fromId,
      toId,
      amountCents,
      kind: "fare",
      method: "simulated",
      key,
    };
  }

  async function getBalance(walletId: string) {
    const [wallet] = await db
      .select({ balanceCents: wallets.balanceCents })
      .from(wallets)
      .where(eq(wallets.id, walletId));
    return wallet.balanceCents;
  }

  it("debits, credits, and records a successful payment", async () => {
    const payer = await createWallet(1_000);
    const receiver = await createWallet(0);

    const transaction = await transfer(paymentInput(payer.id, receiver.id));

    expect(transaction.status).toBe("success");
    expect(await getBalance(payer.id)).toBe(900);
    expect(await getBalance(receiver.id)).toBe(100);
    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.idempotencyKey, transaction.idempotencyKey));
    expect(rows).toHaveLength(1);
  });

  it("records insufficient balance without changing either balance", async () => {
    const payer = await createWallet(50);
    const receiver = await createWallet(0);

    const transaction = await transfer(
      paymentInput(payer.id, receiver.id, randomUUID(), 100),
    );

    expect(transaction.status).toBe("failed");
    expect(transaction.failureReason).toBe("Insufficient balance");
    expect(await getBalance(payer.id)).toBe(50);
    expect(await getBalance(receiver.id)).toBe(0);
    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.idempotencyKey, transaction.idempotencyKey));
    expect(rows).toHaveLength(1);
  });

  it("charges once for repeated idempotency keys and returns the same row", async () => {
    const payer = await createWallet(500);
    const receiver = await createWallet(0);
    const input = paymentInput(payer.id, receiver.id, randomUUID(), 100);

    const first = await transfer(input);
    const second = await transfer(input);

    expect(second.id).toBe(first.id);
    expect(await getBalance(payer.id)).toBe(400);
    expect(await getBalance(receiver.id)).toBe(100);
  });

  it.each([0, -5, 1.5])("records invalid amount %s as failed", async (amount) => {
    const payer = await createWallet(500);
    const receiver = await createWallet(0);

    const transaction = await transfer(
      paymentInput(payer.id, receiver.id, randomUUID(), amount),
    );

    expect(transaction.status).toBe("failed");
    expect(transaction.failureReason).toBe("Invalid amount");
    expect(transaction.amountCents).toBeNull();
    expect(transaction.requestedAmount).toBe(String(amount));
    expect(await getBalance(payer.id)).toBe(500);
    expect(await getBalance(receiver.id)).toBe(0);
  });

  it("rejects a transfer to the same wallet", async () => {
    const wallet = await createWallet(500);

    const transaction = await transfer(
      paymentInput(wallet.id, wallet.id, randomUUID(), 100),
    );

    expect(transaction.status).toBe("failed");
    expect(transaction.failureReason).toBe("Invalid amount");
    expect(await getBalance(wallet.id)).toBe(500);
  });

  it("serializes concurrent payments without allowing a negative balance", async () => {
    const payer = await createWallet(5_000);
    const receiver = await createWallet(0);

    const results = await Promise.all(
      Array.from({ length: 100 }, (_, index) =>
        transfer(
          paymentInput(payer.id, receiver.id, `concurrent-${randomUUID()}-${index}`),
        ),
      ),
    );

    expect(results.filter((transaction) => transaction.status === "success"))
      .toHaveLength(50);
    expect(results.filter((transaction) => transaction.status === "failed"))
      .toHaveLength(50);
    expect(await getBalance(payer.id)).toBe(0);
    expect(await getBalance(receiver.id)).toBe(5_000);

    const persistedBalances = await db
      .select({ balanceCents: wallets.balanceCents })
      .from(wallets)
      .where(inArray(wallets.id, [payer.id, receiver.id]));
    expect(persistedBalances.every(({ balanceCents }) => balanceCents >= 0)).toBe(
      true,
    );
  });

  it("reconciles successful credits and debits with wallet balances", async () => {
    const fundingWallet = await createWallet(350);
    const payer = await createWallet(0);
    const receiver = await createWallet(0);

    await transfer(
      paymentInput(fundingWallet.id, payer.id, randomUUID(), 300),
    );
    await transfer(paymentInput(payer.id, receiver.id, randomUUID(), 200));
    await transfer(paymentInput(receiver.id, payer.id, randomUUID(), 50));
    const rows = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "success"),
          or(
            eq(transactions.fromWalletId, payer.id),
            eq(transactions.toWalletId, payer.id),
            eq(transactions.fromWalletId, receiver.id),
            eq(transactions.toWalletId, receiver.id),
          ),
        ),
      );

    for (const walletId of [payer.id, receiver.id]) {
      const successfulCredits = rows
        .filter((row) => row.toWalletId === walletId)
        .reduce((sum, row) => sum + (row.amountCents ?? 0), 0);
      const successfulDebits = rows
        .filter((row) => row.fromWalletId === walletId)
        .reduce((sum, row) => sum + (row.amountCents ?? 0), 0);

      expect(successfulCredits - successfulDebits).toBe(
        await getBalance(walletId),
      );
    }
  });
});
