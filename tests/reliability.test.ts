import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { and, eq, inArray, or } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { user } from "@/db/auth-schema";
import { profiles, transactions, wallets } from "@/db/schema";
import type { TransferInput } from "@/server/ledger";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

describe.skipIf(!process.env.DATABASE_URL)("ledger reliability", () => {
  let db: typeof import("@/db").db;
  let transfer: typeof import("@/server/ledger").transfer;
  const authUserIds: string[] = [];
  const walletIds: string[] = [];

  beforeAll(async () => {
    ({ db } = await import("@/db"));
    ({ transfer } = await import("@/server/ledger"));
  });

  afterAll(async () => {
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
  });

  async function createWallet(balanceCents = 0) {
    const authUserId = randomUUID();
    authUserIds.push(authUserId);
    await db.insert(user).values({
      id: authUserId,
      name: "Reliability test user",
      email: `${authUserId}@example.test`,
    });
    const [profile] = await db
      .insert(profiles)
      .values({ authUserId, name: "Reliability test user" })
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
    key: string = randomUUID(),
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

  async function fundWallet(
    fundingWalletId: string,
    receiverWalletId: string,
    amountCents: number,
  ) {
    const result = await transfer(
      paymentInput(
        fundingWalletId,
        receiverWalletId,
        `reliability-fund-${randomUUID()}`,
        amountCents,
      ),
    );
    if (result.status !== "success") {
      throw new Error(`Could not fund reliability test wallet: ${result.failureReason}`);
    }
  }

  it(
    "handles concurrent payments, idempotency, deadlock avoidance, and reconciliation",
    async () => {
      const fundingWallet = await createWallet(1_000_000);
      const [limitedPayer, limitedReceiver, keyedPayer, keyedReceiver, left, right] =
        await Promise.all([
          createWallet(),
          createWallet(),
          createWallet(),
          createWallet(),
          createWallet(),
          createWallet(),
        ]);
      const participants = [
        limitedPayer,
        limitedReceiver,
        keyedPayer,
        keyedReceiver,
        left,
        right,
      ];

      await Promise.all([
        fundWallet(fundingWallet.id, limitedPayer.id, 5_000),
        fundWallet(fundingWallet.id, keyedPayer.id, 100),
        fundWallet(fundingWallet.id, left.id, 50_000),
        fundWallet(fundingWallet.id, right.id, 50_000),
      ]);

      const limitedResults = await Promise.all(
        Array.from({ length: 100 }, (_, index) =>
          transfer(
            paymentInput(
              limitedPayer.id,
              limitedReceiver.id,
              `reliability-limited-${randomUUID()}-${index}`,
            ),
          ),
        ),
      );
      expect(
        limitedResults.filter((transaction) => transaction.status === "success"),
      ).toHaveLength(50);
      expect(
        limitedResults.filter((transaction) => transaction.status === "failed"),
      ).toHaveLength(50);
      expect(await getBalance(limitedPayer.id)).toBe(0);
      expect(await getBalance(limitedReceiver.id)).toBe(5_000);
      const limitedBalances = await db
        .select({ balanceCents: wallets.balanceCents })
        .from(wallets)
        .where(inArray(wallets.id, [limitedPayer.id, limitedReceiver.id]));
      expect(limitedBalances.every(({ balanceCents }) => balanceCents >= 0)).toBe(
        true,
      );

      const sharedKey = `reliability-idempotent-${randomUUID()}`;
      const keyedResults = await Promise.all(
        Array.from({ length: 100 }, () =>
          transfer(
            paymentInput(keyedPayer.id, keyedReceiver.id, sharedKey, 100),
          ),
        ),
      );
      expect(new Set(keyedResults.map(({ id }) => id)).size).toBe(1);
      expect(keyedResults.every(({ status }) => status === "success")).toBe(true);
      expect(await getBalance(keyedPayer.id)).toBe(0);
      expect(await getBalance(keyedReceiver.id)).toBe(100);
      const keyedTransactions = await db
        .select({ id: transactions.id })
        .from(transactions)
        .where(eq(transactions.idempotencyKey, sharedKey));
      expect(keyedTransactions).toHaveLength(1);

      const directionalResults = await Promise.all(
        Array.from({ length: 100 }, (_, index) => {
          const even = index % 2 === 0;
          return transfer(
            paymentInput(
              even ? left.id : right.id,
              even ? right.id : left.id,
              `reliability-bidirectional-${randomUUID()}-${index}`,
              1 + (index % 100),
            ),
          );
        }),
      );
      expect(
        directionalResults.every(({ status }) => status === "success"),
      ).toBe(true);
      expect(await getBalance(left.id) + (await getBalance(right.id))).toBe(
        100_000,
      );

      const reconciliation = [];
      for (const wallet of participants) {
        const rows = await db
          .select()
          .from(transactions)
          .where(
            and(
              eq(transactions.status, "success"),
              or(
                eq(transactions.fromWalletId, wallet.id),
                eq(transactions.toWalletId, wallet.id),
              ),
            ),
          );
        const credits = rows
          .filter(({ toWalletId }) => toWalletId === wallet.id)
          .reduce((sum, { amountCents }) => sum + (amountCents ?? 0), 0);
        const debits = rows
          .filter(({ fromWalletId }) => fromWalletId === wallet.id)
          .reduce((sum, { amountCents }) => sum + (amountCents ?? 0), 0);
        const balanceCents = await getBalance(wallet.id);
        expect(credits - debits).toBe(balanceCents);
        reconciliation.push({
          wallet: wallet.id.slice(0, 8),
          credits,
          debits,
          balanceCents,
        });
      }
      const participantBalances = await db
        .select({ balanceCents: wallets.balanceCents })
        .from(wallets)
        .where(inArray(wallets.id, participants.map(({ id }) => id)));
      expect(
        participantBalances.every(({ balanceCents }) => balanceCents >= 0),
      ).toBe(true);

      console.table([
        {
          scenario: "100 limited payments",
          successful: limitedResults.filter(({ status }) => status === "success")
            .length,
          failed: limitedResults.filter(({ status }) => status === "failed").length,
        },
        {
          scenario: "100 same-key payments",
          successful: keyedResults.filter(({ status }) => status === "success")
            .length,
          failed: keyedResults.filter(({ status }) => status === "failed").length,
        },
        {
          scenario: "100 bidirectional payments",
          successful: directionalResults.filter(({ status }) => status === "success")
            .length,
          failed: directionalResults.filter(({ status }) => status === "failed")
            .length,
        },
      ]);
      console.table(reconciliation);
    },
    180_000,
  );
});
