// Money helpers. Amounts are always stored and passed around as whole cents
// (integers). Only convert to rands for display or when reading user input.

/** 1250 -> "R12.50", -500 -> "-R5.00". Throws if cents is not a whole number. */
export function formatCents(cents: number): string {
  if (!Number.isSafeInteger(cents)) throw new Error("Invalid amount");
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const rands = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  return `${sign}R${rands}.${rest}`;
}

export function randsToCents(input: string | number): number {
  const value = String(input).trim();
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(value);
  if (!match) throw new Error("Invalid amount");

  const wholeRands = BigInt(match[1]);
  const fractionalCents = BigInt((match[2] ?? "").padEnd(2, "0") || "0");
  const cents = wholeRands * BigInt(100) + fractionalCents;

  if (cents <= BigInt(0) || cents > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error("Invalid amount");
  }

  return Number(cents);
}

/**
 * "12.50" -> 1250, "12" -> 1200, "0.5" -> 50. An optional leading "R" is allowed.
 * Parsed from the string (not via floats) so "19.99" is exactly 1999.
 * Throws on negatives, more than 2 decimals, or anything that is not a number.
 */
export function toCents(rands: string): number {
  const s = rands.trim().replace(/^R\s*/i, "");
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) throw new Error(`Not a valid rand amount: "${rands}"`);
  const cents = Number(m[1]) * 100 + Number((m[2] ?? "").padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) throw new Error(`Amount too large: "${rands}"`);
  return cents;
}
