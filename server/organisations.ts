"use server";

// Organisations and memberships (TAX-34): the signed-in owner or association admin manages
// their own company, its team, and (for associations) the businesses linked to it.

import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { memberships, organisations, profiles } from "@/db/schema";
import { requireRole } from "@/server/auth";
import { normalizeCompanyCode } from "@/lib/auth-validation";
import { notify } from "@/server/wallet-helpers";
import { memberOrg } from "@/server/work-helpers";
import type { ActionResult } from "@/lib/personal-types";

export type MemberView = {
  profileId: string;
  name: string;
  phone: string | null;
  role: string;
  joinedAt: string;
  isMe: boolean;
};

export type LinkedBusiness = { id: string; name: string; location: string | null; type: "association" | "business" | "merchant" };

async function managerOrg() {
  const { profile } = await requireRole("owner", "association_admin");
  const org = await memberOrg(profile.id);
  return { profile, org };
}

/** Everyone in the company, newest first. */
export async function listMembers(): Promise<MemberView[]> {
  const { profile, org } = await managerOrg();
  if (!org) return [];
  const rows = await db
    .select({ profileId: profiles.id, name: profiles.name, phone: profiles.phone, role: memberships.role, joinedAt: memberships.createdAt })
    .from(memberships)
    .innerJoin(profiles, eq(profiles.id, memberships.profileId))
    .where(eq(memberships.organisationId, org.id))
    .orderBy(memberships.createdAt);
  return rows.map((r) => ({ ...r, joinedAt: r.joinedAt.toISOString(), isMe: r.profileId === profile.id }));
}

/** Take someone off the team. They keep their Taxi Tap account but go back to a customer account. */
export async function removeMember(profileId: string): Promise<ActionResult> {
  const { profile, org } = await managerOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  if (profileId === profile.id) return { ok: false, error: "You cannot remove yourself." };
  if (!/^[0-9a-f-]{36}$/i.test(profileId)) return { ok: false, error: "Member not found." };

  const [member] = await db
    .select({ id: memberships.id, role: memberships.role })
    .from(memberships)
    .where(and(eq(memberships.organisationId, org.id), eq(memberships.profileId, profileId)))
    .limit(1);
  if (!member) return { ok: false, error: "That person is not on your team." };
  if (member.role === "owner" || member.role === "association_admin") return { ok: false, error: "You cannot remove another owner." };

  await db.transaction(async (tx) => {
    await tx.delete(memberships).where(eq(memberships.id, member.id));
    await tx.update(profiles).set({ role: "customer" }).where(eq(profiles.id, profileId));
  });
  await notify(profileId, "security", "Removed from team", `You were removed from ${org.name}. Your account is now a personal account.`);
  return { ok: true };
}

export async function updateOrganisation(input: { name: string; location: string }): Promise<ActionResult> {
  const { org } = await managerOrg();
  if (!org) return { ok: false, error: "You do not have a company yet." };
  const name = input.name.trim();
  const location = input.location.trim();
  if (name.length < 2 || name.length > 80) return { ok: false, error: "Enter the company name (2 to 80 characters)." };
  if (location.length < 2 || location.length > 120) return { ok: false, error: "Enter where you operate." };
  await db.update(organisations).set({ name, location }).where(eq(organisations.id, org.id));
  return { ok: true };
}

/** Association admin: businesses that have joined this association. */
export async function listOrganisations(): Promise<LinkedBusiness[]> {
  const { org } = await requireRole("association_admin").then(async ({ profile }) => ({ org: await memberOrg(profile.id) }));
  if (!org) return [];
  const rows = await db
    .select({ id: organisations.id, name: organisations.name, location: organisations.location, type: organisations.type })
    .from(organisations)
    .where(and(eq(organisations.associationId, org.id), ne(organisations.id, org.id)))
    .orderBy(organisations.name);
  return rows;
}

/** Association admin: link a taxi business to the association using the business's company code. */
export async function linkBusiness(code: string): Promise<ActionResult<{ name: string }>> {
  const { profile } = await requireRole("association_admin");
  const org = await memberOrg(profile.id);
  if (!org) return { ok: false, error: "You do not have an association yet." };
  const clean = normalizeCompanyCode(code);
  if (clean.length !== 9) return { ok: false, error: "Enter all 9 characters of the company code." };

  const [business] = await db.select().from(organisations).where(eq(organisations.joinCode, clean)).limit(1);
  if (!business) return { ok: false, error: "We could not find a company with that code." };
  if (business.id === org.id || business.type === "association") return { ok: false, error: "That company cannot be linked." };
  if (business.associationId && business.associationId !== org.id) return { ok: false, error: "That company already belongs to another association." };
  await db.update(organisations).set({ associationId: org.id }).where(eq(organisations.id, business.id));
  return { ok: true, name: business.name };
}
