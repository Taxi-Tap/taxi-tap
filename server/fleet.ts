"use server";

// Vehicles and stalls linked to the owner business (TAX-35).
// Every action works only on rows owned by the signed-in owner's own company.

import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { stalls, trips, vehicles } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { memberOrg } from "@/server/work-helpers";
import type { ActionResult } from "@/lib/personal-types";

export type VehicleView = { id: string; registration: string; model: string; seats: number };
export type StallView = { id: string; name: string; location: string | null };
type VehicleInput = { registration: string; model: string; seats: number };
type StallInput = { name: string; location: string };

async function ownerOrg() {
  const { profile } = await requireRole("owner");
  return memberOrg(profile.id);
}

function checkVehicle(input: VehicleInput): { error: string } | { registration: string; model: string; seats: number } {
  const registration = input.registration.trim().toUpperCase().replace(/\s+/g, " ");
  if (!/^[A-Z0-9 ]{4,12}$/.test(registration)) return { error: "Enter the number plate, for example ND 41 QZ ZN." };
  if (!Number.isInteger(input.seats) || input.seats < 4 || input.seats > 30) return { error: "Seats must be between 4 and 30." };
  return { registration, model: input.model.trim().slice(0, 60) || "Minibus taxi", seats: input.seats };
}

function checkStall(input: StallInput): { error: string } | { name: string; location: string } {
  const name = input.name.trim();
  const location = input.location.trim();
  if (name.length < 2 || name.length > 80) return { error: "Enter the stall name (2 to 80 characters)." };
  if (location.length > 120) return { error: "Location is too long." };
  return { name, location };
}

export async function listVehicles(): Promise<VehicleView[]> {
  const org = await ownerOrg();
  if (!org) return [];
  const rows = await db.select().from(vehicles).where(eq(vehicles.ownerOrgId, org.id)).orderBy(vehicles.registration);
  return rows.map((v) => ({ id: v.id, registration: v.registration, model: v.model, seats: v.seats }));
}

export async function createVehicle(input: VehicleInput): Promise<ActionResult<{ id: string }>> {
  const org = await ownerOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  const v = checkVehicle(input);
  if ("error" in v) return { ok: false, error: v.error };
  const [taken] = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.registration, v.registration)).limit(1);
  if (taken) return { ok: false, error: "That number plate is already registered." };
  const [row] = await db.insert(vehicles).values({ ...v, ownerOrgId: org.id }).returning({ id: vehicles.id });
  return { ok: true, id: row.id };
}

export async function updateVehicle(id: string, input: VehicleInput): Promise<ActionResult> {
  const org = await ownerOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  const v = checkVehicle(input);
  if ("error" in v) return { ok: false, error: v.error };
  const [own] = await db.select({ id: vehicles.id }).from(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.ownerOrgId, org.id))).limit(1);
  if (!own) return { ok: false, error: "That vehicle was not found." };
  try {
    await db.update(vehicles).set(v).where(eq(vehicles.id, id));
  } catch {
    return { ok: false, error: "That number plate is already registered." };
  }
  return { ok: true };
}

/** A vehicle that has been used on a trip is part of the payment history, so it cannot be deleted. */
export async function removeVehicle(id: string): Promise<ActionResult> {
  const org = await ownerOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  const [own] = await db.select({ id: vehicles.id }).from(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.ownerOrgId, org.id))).limit(1);
  if (!own) return { ok: false, error: "That vehicle was not found." };
  const [used] = await db.select({ n: count() }).from(trips).where(eq(trips.vehicleId, id));
  if ((used?.n ?? 0) > 0) return { ok: false, error: "This vehicle has trips on record, so it cannot be removed." };
  await db.delete(vehicles).where(eq(vehicles.id, id));
  return { ok: true };
}

export async function listStalls(): Promise<StallView[]> {
  const org = await ownerOrg();
  if (!org) return [];
  const rows = await db.select().from(stalls).where(eq(stalls.ownerOrgId, org.id)).orderBy(stalls.name);
  return rows.map((s) => ({ id: s.id, name: s.name, location: s.location }));
}

export async function createStall(input: StallInput): Promise<ActionResult<{ id: string }>> {
  const org = await ownerOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  const s = checkStall(input);
  if ("error" in s) return { ok: false, error: s.error };
  const [row] = await db.insert(stalls).values({ ownerOrgId: org.id, name: s.name, location: s.location || null }).returning({ id: stalls.id });
  return { ok: true, id: row.id };
}

export async function updateStall(id: string, input: StallInput): Promise<ActionResult> {
  const org = await ownerOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  const s = checkStall(input);
  if ("error" in s) return { ok: false, error: s.error };
  const [own] = await db.select({ id: stalls.id }).from(stalls).where(and(eq(stalls.id, id), eq(stalls.ownerOrgId, org.id))).limit(1);
  if (!own) return { ok: false, error: "That stall was not found." };
  await db.update(stalls).set({ name: s.name, location: s.location || null }).where(eq(stalls.id, id));
  return { ok: true };
}

export async function removeStall(id: string): Promise<ActionResult> {
  const org = await ownerOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  await db.delete(stalls).where(and(eq(stalls.id, id), eq(stalls.ownerOrgId, org.id)));
  return { ok: true };
}
