// Single use is enforced later in the database, inside the payment transaction, using the nonce.
import { signPayload, verifyPayload } from "./signed";

const WALLET_TOKEN_TTL_MS = 60_000;

type WalletPayload = {
  w: string;
  kind: string;
  nonce: string;
};

export function makeWalletToken(
  walletId: string,
  now = Date.now(),
): { token: string; nonce: string; expiresAt: number } {
  const expiresAt = now + WALLET_TOKEN_TTL_MS;
  const { token, nonce } = signPayload(
    { w: walletId, kind: "wallet" },
    WALLET_TOKEN_TTL_MS,
    now,
  );

  return { token, nonce, expiresAt };
}

export function checkWalletToken(
  token: string,
  now = Date.now(),
):
  | { ok: true; walletId: string; nonce: string }
  | { ok: false; why: string } {
  const result = verifyPayload<WalletPayload>(token, now);
  if (!result.ok) {
    return result;
  }

  if (result.data.kind !== "wallet" || typeof result.data.w !== "string") {
    return { ok: false, why: "Invalid code" };
  }

  return { ok: true, walletId: result.data.w, nonce: result.data.nonce };
}
