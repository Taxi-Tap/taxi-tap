"use server";

// TODO TAX-38: transfer() is the only way money moves (db.transaction + idempotency key).
export async function transfer(): Promise<never> {
  throw new Error("Not implemented");
}
