"use server";

// TODO TAX-44: pay a fare or merchant by QR/NFC; call transfer() with an idempotency key.
export async function payFare(): Promise<never> {
  throw new Error("Not implemented");
}
