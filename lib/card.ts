/** A stable 16-digit card number derived from the wallet id (demo only, not a real PAN). */
export function cardNumber(walletId: string): string {
  const hex = walletId.replace(/-/g, "");
  let digits = "";
  for (const ch of hex) digits += String(parseInt(ch, 16) % 10);
  return digits.padEnd(16, "0").slice(0, 16);
}

export function groupCardNumber(n: string): string {
  return n.replace(/(.{4})(?=.)/g, "$1 ");
}
