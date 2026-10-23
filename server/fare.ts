export function calcFare(
  band: { id: string; amountCents: number },
  qty: number,
): number {
  if (!Number.isInteger(qty) || qty < 1) {
    throw new Error("Invalid quantity");
  }
  if (!Number.isInteger(band.amountCents) || band.amountCents <= 0) {
    throw new Error("Invalid fare");
  }

  return band.amountCents * qty;
}
