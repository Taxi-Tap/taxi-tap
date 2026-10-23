import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

type VerifyResult<T> = { ok: true; data: T } | { ok: false; why: string };

function getSecret(): string {
  const secret = process.env.QR_SECRET;
  if (!secret) {
    throw new Error("QR_SECRET must be configured");
  }
  return secret;
}

function sign(body: string): string {
  return createHmac("sha256", getSecret()).update(body).digest("base64url");
}

export function signPayload(
  data: Record<string, string | number>,
  ttlMs: number,
  now = Date.now(),
): { nonce: string; token: string } {
  const nonce = randomBytes(16).toString("base64url");
  const payload = { ...data, nonce, exp: now + ttlMs };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return { nonce, token: `${body}.${sign(body)}` };
}

export function verifyPayload<T>(
  token: string,
  now = Date.now(),
): VerifyResult<T> {
  const parts = token.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { ok: false, why: "Invalid code" };
  }

  const [body, signature] = parts;
  const expectedSignature = sign(body);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expectedSignature);

  if (
    actualBytes.length !== expectedBytes.length ||
    !timingSafeEqual(actualBytes, expectedBytes)
  ) {
    return { ok: false, why: "Invalid code" };
  }

  try {
    const payload: unknown = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    );
    if (
      typeof payload !== "object" ||
      payload === null ||
      Array.isArray(payload) ||
      typeof (payload as { nonce?: unknown }).nonce !== "string" ||
      typeof (payload as { exp?: unknown }).exp !== "number" ||
      !Number.isFinite((payload as { exp: number }).exp)
    ) {
      return { ok: false, why: "Invalid code" };
    }

    if (now > (payload as { exp: number }).exp) {
      return { ok: false, why: "Code expired" };
    }

    return { ok: true, data: payload as T };
  } catch {
    return { ok: false, why: "Invalid code" };
  }
}
