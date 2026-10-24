import { beforeAll, describe, expect, it } from "vitest";
import { signPayload } from "@/server/signed";
import { checkWalletToken, makeWalletToken } from "@/server/wallet-token";

beforeAll(() => {
  process.env.QR_SECRET = "test-secret";
});

describe("wallet tokens", () => {
  it("checks a valid wallet token", () => {
    const { token, nonce, expiresAt } = makeWalletToken("wallet-1", 1_000);

    expect(expiresAt).toBe(61_000);
    expect(checkWalletToken(token, 1_000)).toEqual({
      ok: true,
      walletId: "wallet-1",
      nonce,
    });
  });

  it("rejects a changed token", () => {
    const { token } = makeWalletToken("wallet-1", 1_000);
    const changedToken = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

    expect(checkWalletToken(changedToken, 1_000)).toEqual({
      ok: false,
      why: "Invalid code",
    });
  });

  it("rejects a token after 61 seconds", () => {
    const { token } = makeWalletToken("wallet-1", 1_000);

    expect(checkWalletToken(token, 62_000)).toEqual({
      ok: false,
      why: "Code expired",
    });
  });

  it("rejects a valid signed token of another kind", () => {
    const { token } = signPayload(
      { w: "wallet-1", kind: "payment" },
      60_000,
      1_000,
    );

    expect(checkWalletToken(token, 1_000)).toEqual({
      ok: false,
      why: "Invalid code",
    });
  });

  it("rejects an empty token", () => {
    expect(checkWalletToken("")).toEqual({
      ok: false,
      why: "Invalid code",
    });
  });
});
