"use server";

// Driver side: pick a vehicle and route (shift), start and end a trip, charge fares, see takings.
// Every fare goes to the owner company's wallet, never to the driver (TAX-48, TAX-50, TAX-57).

import { randomUUID } from "node:crypto";
import { and, desc, eq, gte, inArray, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { fareBands, routes, transactions, trips, vehicles } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { calcFare } from "@/server/fare";
import { transfer } from "@/server/ledger";
import { ensureWallet, systemFundsWallet } from "@/server/wallet-helpers";
import { memberOrg, startOfToday } from "@/server/work-helpers";
import { timeLabel } from "@/lib/format";
import type { ActionResult } from "@/lib/personal-types";
import type { ActiveTrip, RouteOption, TakingsView, VehicleOption } from "@/lib/work-types";

async function loadRoutes(orgIds: string[]): Promise<RouteOption[]> {
  if (orgIds.length === 0) return [];
  const rows = await db.select().from(routes).where(inArray(routes.associationId, orgIds)).orderBy(routes.name);
  if (rows.length === 0) return [];
  const bands = await db.select().from(fareBands).where(inArray(fareBands.routeId, rows.map((r) => r.id))).orderBy(fareBands.sortOrder);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    model: r.fareModel,
    bands: bands.filter((b) => b.routeId === r.id).map((b) => ({ id: b.id, label: b.label, amountCents: b.amountCents })),
  }));
}

/** Vehicles and routes this driver can start a shift with: their company's, plus its association's routes. */
export async function getShiftOptions(): Promise<{ company: string | null; vehicles: VehicleOption[]; routes: RouteOption[] }> {
  const { profile } = await requireRole("driver");
  const org = await memberOrg(profile.id);
  if (!org) return { company: null, vehicles: [], routes: [] };
  const cars = await db.select().from(vehicles).where(eq(vehicles.ownerOrgId, org.id)).orderBy(vehicles.registration);
  return {
    company: org.name,
    vehicles: cars.map((v) => ({ id: v.id, registration: v.registration, model: v.model, seats: v.seats })),
    routes: await loadRoutes(org.associationId ? [org.id, org.associationId] : [org.id]),
  };
}

async function tripSummary(tripId: string) {
  const [t] = await db
    .select({
      total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`.mapWith(Number),
      payments: sql<number>`count(*)`.mapWith(Number),
      passengers: sql<number>`coalesce(sum(${transactions.quantity}), 0)`.mapWith(Number),
    })
    .from(transactions)
    .where(and(eq(transactions.tripId, tripId), eq(transactions.status, "success")));
  return t ?? { total: 0, payments: 0, passengers: 0 };
}

export async function getActiveTrip(): Promise<ActiveTrip | null> {
  const { profile } = await requireRole("driver");
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.driverId, profile.id), isNull(trips.endedAt)))
    .orderBy(desc(trips.startedAt))
    .limit(1);
  if (!trip) return null;
  const [routeRow] = await db.select({ owner: routes.associationId }).from(routes).where(eq(routes.id, trip.routeId)).limit(1);
  const [[vehicle], routeList, sum] = await Promise.all([
    db.select().from(vehicles).where(eq(vehicles.id, trip.vehicleId)).limit(1),
    loadRoutes(routeRow ? [routeRow.owner] : []),
    tripSummary(trip.id),
  ]);
  const route = routeList.find((x) => x.id === trip.routeId);
  if (!vehicle || !route) return null;
  return {
    id: trip.id,
    startedAt: trip.startedAt.toISOString(),
    vehicle: { id: vehicle.id, registration: vehicle.registration, model: vehicle.model, seats: vehicle.seats },
    route,
    totalCents: sum.total,
    payments: sum.payments,
    passengers: sum.passengers,
  };
}

export async function startTrip(input: { vehicleId: string; routeId: string }): Promise<ActionResult<{ tripId: string }>> {
  const { profile } = await requireRole("driver");
  const org = await memberOrg(profile.id);
  if (!org) return { ok: false, error: "You are not part of a company yet." };

  const [vehicle] = await db.select().from(vehicles).where(and(eq(vehicles.id, input.vehicleId), eq(vehicles.ownerOrgId, org.id))).limit(1);
  if (!vehicle) return { ok: false, error: "That vehicle is not part of your company." };
  const allowed = org.associationId ? [org.id, org.associationId] : [org.id];
  const [route] = await db.select().from(routes).where(and(eq(routes.id, input.routeId), inArray(routes.associationId, allowed))).limit(1);
  if (!route) return { ok: false, error: "That route is not available to your company." };

  const [open] = await db.select({ id: trips.id }).from(trips).where(and(eq(trips.driverId, profile.id), isNull(trips.endedAt))).limit(1);
  if (open) return { ok: true, tripId: open.id }; // Already on a trip: carry on with it.

  const [trip] = await db.insert(trips).values({ vehicleId: vehicle.id, driverId: profile.id, routeId: route.id }).returning({ id: trips.id });
  return { ok: true, tripId: trip.id };
}

export async function endTrip(): Promise<ActionResult> {
  const { profile } = await requireRole("driver");
  await db.update(trips).set({ endedAt: sql`now()` }).where(and(eq(trips.driverId, profile.id), isNull(trips.endedAt)));
  return { ok: true };
}

/**
 * Charge a fare on the current trip. Real passenger scans and taps are not wired yet
 * (TAX-43, qr.ts), so this takes the fare from the "Demo funds (system)" wallet as a simulated passenger.
 */
export async function chargeFare(input: {
  bandId: string;
  quantity: number;
  key?: string;
  latitude?: number;
  longitude?: number;
}): Promise<ActionResult<{ amountCents: number; tripTotalCents: number }>> {
  const { profile } = await requireRole("driver");
  const [trip] = await db.select().from(trips).where(and(eq(trips.driverId, profile.id), isNull(trips.endedAt))).limit(1);
  if (!trip) return { ok: false, error: "Start a trip first." };
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 30) {
    return { ok: false, error: "Passengers must be between 1 and 30." };
  }
  const [band] = await db.select().from(fareBands).where(and(eq(fareBands.id, input.bandId), eq(fareBands.routeId, trip.routeId))).limit(1);
  if (!band) return { ok: false, error: "That fare is not on this route." };
  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, trip.vehicleId)).limit(1);
  if (!vehicle) return { ok: false, error: "Vehicle not found." };

  const [passenger, ownerWallet] = await Promise.all([systemFundsWallet(), ensureWallet("organisation", vehicle.ownerOrgId)]);
  const amountCents = calcFare(band, input.quantity);
  const tx = await transfer({
    fromId: passenger.id,
    toId: ownerWallet.id,
    amountCents,
    kind: "fare",
    method: "simulated",
    key: input.key ?? randomUUID(),
    tripId: trip.id,
    fareBandId: band.id,
    staffId: profile.id,
    qty: input.quantity,
    latitude: input.latitude,
    longitude: input.longitude,
  });
  if (tx.status !== "success") return { ok: false, error: tx.failureReason ?? "Payment failed" };
  const sum = await tripSummary(trip.id);
  return { ok: true, amountCents, tripTotalCents: sum.total };
}

/** Today's takings for this driver (shift summary). */
export async function getTakings(): Promise<TakingsView> {
  const { profile } = await requireRole("driver");
  const since = startOfToday();
  const rows = await db
    .select({ tx: transactions, band: fareBands.label })
    .from(transactions)
    .leftJoin(fareBands, eq(fareBands.id, transactions.fareBandId))
    .where(and(eq(transactions.staffId, profile.id), eq(transactions.kind, "fare"), gte(transactions.createdAt, since)))
    .orderBy(desc(transactions.createdAt))
    .limit(100);
  const ok = rows.filter((r) => r.tx.status === "success");
  const [tripCount] = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(trips)
    .where(and(eq(trips.driverId, profile.id), gte(trips.startedAt, since)));
  return {
    todayCents: ok.reduce((s, r) => s + (r.tx.amountCents ?? 0), 0),
    payments: ok.length,
    passengers: ok.reduce((s, r) => s + r.tx.quantity, 0),
    trips: tripCount?.n ?? 0,
    recent: rows.slice(0, 20).map((r) => ({
      id: r.tx.id,
      time: timeLabel(r.tx.createdAt.toISOString()),
      label: r.band ? `To ${r.band}` : "Fare",
      passengers: r.tx.quantity,
      amountCents: r.tx.amountCents ?? 0,
      ok: r.tx.status === "success",
    })),
  };
}

/** Owner company name shown on the Start-your-shift copy. */
export async function getMyCompanyName(): Promise<string | null> {
  const { profile } = await requireRole("driver");
  const org = await memberOrg(profile.id);
  return org?.name ?? null;
}
