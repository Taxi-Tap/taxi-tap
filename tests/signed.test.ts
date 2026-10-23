import { beforeAll, describe, expect, it } from "vitest";
import { signPayload, verifyPayload } from "@/server/signed";

beforeAll(() => {
  process.env.QR_SECRET = "test-secret";
});

describe("signed payloads", () => {
  it("verifies a good code", () => {
    const { token, nonce } = signPayload({ merchantId: "merchant-1" }, 1_000);
    const result = verifyPayload<{ merchantId: string; nonce: string }>(token);

    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({ merchantId: "merchant-1", nonce }),
    });
  });

  it("rejects a code with a changed character", () => {
    const { token } = signPayload({ merchantId: "merchant-1" }, 1_000);
    const changedToken = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

    expect(verifyPayload(changedToken)).toEqual({
      ok: false,
      why: "Invalid code",
    });
  });

  it("returns an expired-code error", () => {
    const { token } = signPayload({ merchantId: "merchant-1" }, 1_000, 100);

    expect(verifyPayload(token, 1_101)).toEqual({
      ok: false,
      why: "Code expired",
    });
  });

  it.each(["nonsense", ""])("rejects invalid input %j", (token) => {
    expect(verifyPayload(token)).toEqual({
      ok: false,
      why: "Invalid code",
    });
  });
});
