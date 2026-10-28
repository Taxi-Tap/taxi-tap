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

export function fareFor(
  route: {
    fareModel: "flat" | "ladder";
    bands: { id: string; amountCents: number }[];
  },
  bandId: string,
  qty: number,
): number {
  let band: { id: string; amountCents: number } | undefined;

  if (route.fareModel === "flat") {
    if (route.bands.length !== 1) {
      throw new Error("Flat route needs one band");
    }
    band = route.bands[0];
  } else {
    band = route.bands.find((candidate) => candidate.id === bandId);
    if (!band) {
      throw new Error("Unknown fare band");
    }
  }

  return calcFare(band, qty);
}
