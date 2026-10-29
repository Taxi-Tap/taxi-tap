// Shared by the driver actions: find the current trip and price a fare from the database.
// Not a "use server" file: it takes arbitrary ids.

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { fareBands, trips, vehicles } from "@/db/schema";
import { calcFare } from "@/server/fare";

export async function fareContext(driverProfileId: string, bandId: string, quantity: number) {
  const [trip] = await db.select().from(trips).where(and(eq(trips.driverId, driverProfileId), isNull(trips.endedAt))).limit(1);
  if (!trip) return { ok: false as const, error: "Start a trip first." };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 30) {
    return { ok: false as const, error: "Passengers must be between 1 and 30." };
  }
  const [band] = await db.select().from(fareBands).where(and(eq(fareBands.id, bandId), eq(fareBands.routeId, trip.routeId))).limit(1);
  if (!band) return { ok: false as const, error: "That fare is not on this route." };
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, trip.vehicleId)).limit(1);
  if (!vehicle) return { ok: false as const, error: "Vehicle not found." };
  return { ok: true as const, trip, band, vehicle, amountCents: calcFare(band, quantity) };
}
