"use server";

// Owner side: company profile and join code, team, wallet, fares and routes.
// Real rows come first; lib/owner-mock.ts fills the screens with labelled sample data.

import { and, count, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { fareBands, memberships, organisations, profiles, routes, stalls, transactions, vehicles } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { newJoinCode } from "@/server/join-code";
import { ensureWallet, walletNames } from "@/server/wallet-helpers";
import {
  SAMPLE_DRIVER_PROFILES,
  SAMPLE_OWNER_TX,
  SAMPLE_PEOPLE,
  SAMPLE_ROUTES,
  SAMPLE_TEAM,
  SAMPLE_WALLET,
  type OwnerTx,
  type RouteView,
  type TeamEntry,
} from "@/lib/owner-mock";
import type { CompanyView, OwnerView, TeamDetail } from "@/lib/owner-types";
import type { ActionResult } from "@/lib/personal-types";

/** The company the signed-in owner belongs to. */
async function myOrg() {
  const { profile, session } = await requireRole("owner");
  const [row] = await db
    .select({ org: organisations })
    .from(memberships)
    .innerJoin(organisations, eq(organisations.id, memberships.organisationId))
    .where(eq(memberships.profileId, profile.id))
    .limit(1);
  return { profile, session, org: row?.org ?? null };
}

export async function getCompany(): Promise<{ company: CompanyView | null; owner: OwnerView }> {
  const { profile, session, org } = await myOrg();
  const [p] = await db.select().from(profiles).where(eq(profiles.id, profile.id)).limit(1);
  const owner: OwnerView = {
    name: profile.name,
    email: session.user.email,
    phone: p?.phone ?? null,
    createdAt: (p?.createdAt ?? new Date()).toISOString(),
  };
  if (!org) return { company: null, owner };

  // Companies created before join codes existed get one the first time the owner opens the profile.
  let joinCode = org.joinCode;
  if (!joinCode) {
    joinCode = newJoinCode();
    await db.update(organisations).set({ joinCode }).where(eq(organisations.id, org.id));
  }
  const [members] = await db.select({ n: count() }).from(memberships).where(eq(memberships.organisationId, org.id));
  return {
    company: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logoUrl: org.logoUrl,
      location: org.location,
      type: org.type,
      joinCode,
      memberCount: members?.n ?? 1,
      createdAt: org.createdAt.toISOString(),
    },
    owner,
  };
}

/** Invalidates the old code: anyone who has not joined yet needs the new one. */
export async function regenerateJoinCode(): Promise<ActionResult<{ joinCode: string }>> {
  const { org } = await myOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  const joinCode = newJoinCode();
  await db.update(organisations).set({ joinCode }).where(eq(organisations.id, org.id));
  return { ok: true, joinCode };
}

const KIND_FOR_ROLE = { driver: "driver", merchant_staff: "staff" } as const;

export async function getTeam(): Promise<TeamEntry[]> {
  const { profile, org } = await myOrg();
  const real: TeamEntry[] = [];
  if (org) {
    const members = await db
      .select({ id: profiles.id, name: profiles.name, phone: profiles.phone, role: memberships.role })
      .from(memberships)
      .innerJoin(profiles, eq(profiles.id, memberships.profileId))
      .where(and(eq(memberships.organisationId, org.id), ne(memberships.profileId, profile.id)));
    for (const m of members) {
      real.push({ id: m.id, kind: KIND_FOR_ROLE[m.role as keyof typeof KIND_FOR_ROLE] ?? "staff", name: m.name, detail: m.phone ?? "No phone added", sample: false });
    }
    const cars = await db.select({ id: vehicles.id, registration: vehicles.registration, model: vehicles.model }).from(vehicles).where(eq(vehicles.ownerOrgId, org.id));
    for (const v of cars) real.push({ id: v.id, kind: "vehicle", name: v.model, detail: v.registration, sample: false });
    const stallRows = await db.select({ id: stalls.id, name: stalls.name, location: stalls.location }).from(stalls).where(eq(stalls.ownerOrgId, org.id));
    for (const s of stallRows) real.push({ id: s.id, kind: "stall", name: s.name, detail: s.location ?? "", sample: false });
  }
  return [...real, ...SAMPLE_TEAM];
}

export async function getTeamMember(id: string): Promise<TeamDetail | null> {
  const { org } = await myOrg();
  const sample = SAMPLE_TEAM.find((t) => t.id === id);
  if (sample) {
    return { ...sample, person: SAMPLE_PEOPLE[id], driver: SAMPLE_DRIVER_PROFILES[id] };
  }
  if (!org || !/^[0-9a-f-]{36}$/i.test(id)) return null;

  const [member] = await db
    .select({ id: profiles.id, name: profiles.name, phone: profiles.phone, role: memberships.role, email: user.email })
    .from(memberships)
    .innerJoin(profiles, eq(profiles.id, memberships.profileId))
    .innerJoin(user, eq(user.id, profiles.authUserId))
    .where(and(eq(memberships.organisationId, org.id), eq(profiles.id, id)))
    .limit(1);
  if (member) {
    const [firstName, ...rest] = member.name.split(" ");
    return {
      id: member.id,
      kind: KIND_FOR_ROLE[member.role as keyof typeof KIND_FOR_ROLE] ?? "staff",
      name: member.name,
      detail: member.phone ?? "No phone added",
      sample: false,
      person: { firstName, surname: rest.join(" ") || "-", phone: member.phone ?? "Not added", dob: "Not provided", gender: "Not provided" },
      driver:
        member.role === "driver"
          ? { vehicle: "Not assigned", seats: 0, registration: "-", todayCents: 0, trips: 0, recent: [] }
          : undefined,
    };
  }
  const [car] = await db.select().from(vehicles).where(and(eq(vehicles.id, id), eq(vehicles.ownerOrgId, org.id))).limit(1);
  if (car) return { id: car.id, kind: "vehicle", name: car.model, detail: `${car.registration} • ${car.seats} seats`, sample: false };
  const [stall] = await db.select().from(stalls).where(and(eq(stalls.id, id), eq(stalls.ownerOrgId, org.id))).limit(1);
  if (stall) return { id: stall.id, kind: "stall", name: stall.name, detail: stall.location ?? "", sample: false };
  return null;
}

/** Company wallet. With no payments yet, sample figures are shown so the screen is reviewable. */
export async function getOwnerWallet(): Promise<{
  walletId: string | null;
  balanceCents: number;
  currentCents: number;
  pendingCents: number;
  cardLast4: string;
  transactions: OwnerTx[];
  sample: boolean;
}> {
  const { org } = await myOrg();
  if (!org) return { walletId: null, ...sampleWallet(), sample: true };
  const wallet = await ensureWallet("organisation", org.id);
  const rows = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.toWalletId, wallet.id), eq(transactions.status, "success")))
    .orderBy(desc(transactions.createdAt))
    .limit(20);
  if (rows.length === 0 && wallet.balanceCents === 0) return { walletId: wallet.id, ...sampleWallet(), sample: true };

  const names = await walletNames([...new Set(rows.map((r) => r.fromWalletId))]);
  const last4 = wallet.id.replace(/\D/g, "").padEnd(4, "0").slice(0, 4);
  return {
    walletId: wallet.id,
    balanceCents: wallet.balanceCents,
    currentCents: wallet.balanceCents,
    pendingCents: 0,
    cardLast4: last4,
    transactions: rows.map((r) => ({
      id: r.id,
      kind: r.kind === "merchant" ? "stall" : "vehicle",
      title: r.kind === "fare" ? "Taxi fare" : "Payment",
      subtitle: names.get(r.fromWalletId) ?? "Customer",
      amountCents: r.amountCents ?? 0,
    })),
    sample: false,
  };
}

function sampleWallet() {
  return {
    balanceCents: SAMPLE_WALLET.balanceCents,
    currentCents: SAMPLE_WALLET.currentCents,
    pendingCents: SAMPLE_WALLET.pendingCents,
    cardLast4: "0000",
    transactions: SAMPLE_OWNER_TX,
  };
}

export async function getMapSummary() {
  return { paymentsToday: SAMPLE_WALLET.paymentsToday, densest: SAMPLE_WALLET.densest };
}

export async function listOwnerRoutes(): Promise<RouteView[]> {
  const { org } = await myOrg();
  if (!org) return SAMPLE_ROUTES;
  const rows = await db.select().from(routes).where(eq(routes.associationId, org.id)).orderBy(routes.name);
  const real: RouteView[] = [];
  if (rows.length > 0) {
    const bands = await db.select().from(fareBands).where(inArray(fareBands.routeId, rows.map((r) => r.id))).orderBy(fareBands.sortOrder);
    for (const r of rows) {
      real.push({
        id: r.id,
        name: r.name,
        model: r.fareModel,
        sample: false,
        bands: bands.filter((b) => b.routeId === r.id).map((b) => ({ id: b.id, label: b.label, amountCents: b.amountCents })),
      });
    }
  }
  return [...real, ...SAMPLE_ROUTES];
}

export async function getOwnerRoute(id: string): Promise<RouteView | null> {
  const { org } = await myOrg();
  const sample = SAMPLE_ROUTES.find((r) => r.id === id);
  if (sample) return sample;
  if (!org || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [route] = await db.select().from(routes).where(and(eq(routes.id, id), eq(routes.associationId, org.id))).limit(1);
  if (!route) return null;
  const bands = await db.select().from(fareBands).where(eq(fareBands.routeId, route.id)).orderBy(fareBands.sortOrder);
  return { id: route.id, name: route.name, model: route.fareModel, sample: false, bands: bands.map((b) => ({ id: b.id, label: b.label, amountCents: b.amountCents })) };
}

type RouteInput = { name: string; model: "flat" | "ladder"; bands: { label: string; amountCents: number }[] };

function checkRoute(input: RouteInput): string | null {
  if (input.name.trim().length < 3) return "Enter a route name.";
  if (input.bands.length === 0) return "Add at least one fare.";
  if (input.model === "flat" && input.bands.length !== 1) return "A flat route has exactly one fare.";
  for (const b of input.bands) {
    if (!b.label.trim()) return "Every fare needs a stop name.";
    if (!Number.isSafeInteger(b.amountCents) || b.amountCents <= 0) return "Every fare needs an amount above R0.00.";
  }
  return null;
}

export async function createRoute(input: RouteInput): Promise<ActionResult<{ id: string }>> {
  const { org } = await myOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  const problem = checkRoute(input);
  if (problem) return { ok: false, error: problem };
  const id = await db.transaction(async (tx) => {
    const [route] = await tx.insert(routes).values({ name: input.name.trim(), associationId: org.id, fareModel: input.model }).returning({ id: routes.id });
    await tx.insert(fareBands).values(input.bands.map((b, i) => ({ routeId: route.id, label: b.label.trim(), amountCents: b.amountCents, sortOrder: i })));
    return route.id;
  });
  return { ok: true, id };
}

export async function updateRoute(id: string, input: RouteInput): Promise<ActionResult> {
  const { org } = await myOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  const problem = checkRoute(input);
  if (problem) return { ok: false, error: problem };
  const [route] = await db.select({ id: routes.id }).from(routes).where(and(eq(routes.id, id), eq(routes.associationId, org.id))).limit(1);
  if (!route) return { ok: false, error: "That route was not found." };
  try {
    await db.transaction(async (tx) => {
      await tx.update(routes).set({ name: input.name.trim(), fareModel: input.model }).where(eq(routes.id, id));
      await tx.delete(fareBands).where(eq(fareBands.routeId, id));
      await tx.insert(fareBands).values(input.bands.map((b, i) => ({ routeId: id, label: b.label.trim(), amountCents: b.amountCents, sortOrder: i })));
    });
  } catch {
    // Past payments point at fare bands, so a band that has been paid cannot be deleted.
    return { ok: false, error: "Fares that already have payments cannot be replaced. Add a new route instead." };
  }
  return { ok: true };
}

/** Add a taxi to the company so drivers can pick it when they start a shift. */
export async function createVehicle(input: { registration: string; model: string; seats: number }): Promise<ActionResult> {
  const { org } = await myOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  const registration = input.registration.trim().toUpperCase().replace(/\s+/g, " ");
  if (!/^[A-Z0-9 ]{4,12}$/.test(registration)) return { ok: false, error: "Enter the number plate, for example ND 41 QZ ZN." };
  const model = input.model.trim() || "Minibus taxi";
  if (!Number.isInteger(input.seats) || input.seats < 4 || input.seats > 30) return { ok: false, error: "Seats must be between 4 and 30." };
  const [taken] = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.registration, registration)).limit(1);
  if (taken) return { ok: false, error: "That number plate is already registered." };
  await db.insert(vehicles).values({ registration, ownerOrgId: org.id, model: model.slice(0, 60), seats: input.seats });
  return { ok: true };
}
