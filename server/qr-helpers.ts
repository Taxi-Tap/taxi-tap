// Issue and consume customer payment codes (signed QR token, or the short manual code).
// Not a "use server" file: consumeQr takes any credential and must not be callable from the browser.

import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { qrTokens } from "@/db/schema";
import { newQrCode } from "@/server/join-code";
import { checkWalletToken, makeWalletToken } from "@/server/wallet-token";

/** A customer code is valid for 60 seconds and works once. */
export async function issueQr(walletId: string) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const { token, nonce, expiresAt } = makeWalletToken(walletId);
    const code = newQrCode();
    const [row] = await db
      .insert(qrTokens)
      .values({ walletId, nonce, code, expiresAt: new Date(expiresAt) })
      .onConflictDoNothing()
      .returning({ id: qrTokens.id });
    if (row) return { token, code, nonce, expiresAt };
  }
  throw new Error("Could not issue a code");
}

export type Consumed = { ok: true; walletId: string; nonce: string } | { ok: false; error: string };

/** Marks the code used, atomically, and says whose wallet it belongs to. */
export async function consumeQr(credential: string): Promise<Consumed> {
  const raw = credential.trim();
  if (!raw) return { ok: false, error: "Invalid code" };

  let walletId: string | null = null;
  let lookup;
  if (raw.includes(".")) {
    const checked = checkWalletToken(raw);
    if (!checked.ok) return { ok: false, error: checked.why };
    walletId = checked.walletId;
    lookup = eq(qrTokens.nonce, checked.nonce);
  } else {
    const code = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (code.length !== 8) return { ok: false, error: "Invalid code" };
    lookup = eq(qrTokens.code, code);
  }

  const [row] = await db.select().from(qrTokens).where(lookup).limit(1);
  if (!row || (walletId && row.walletId !== walletId)) return { ok: false, error: "Invalid code" };
  if (row.usedAt) return { ok: false, error: "Code already used" };
  if (row.expiresAt.getTime() < Date.now()) return { ok: false, error: "Code expired" };

  const [claimed] = await db
    .update(qrTokens)
    .set({ usedAt: sql`now()` })
    .where(and(eq(qrTokens.id, row.id), isNull(qrTokens.usedAt), gt(qrTokens.expiresAt, sql`now()`)))
    .returning({ id: qrTokens.id });
  if (!claimed) return { ok: false, error: "Code already used" };
  return { ok: true, walletId: row.walletId, nonce: row.nonce };
}
