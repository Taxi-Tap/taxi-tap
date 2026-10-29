"use server";

// Personal account: profile screen data and the Settings toggles.

import { headers } from "next/headers";
import { and, count, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications, profiles } from "@/db/schema";
import { auth, requireUser } from "@/server/auth";
import { memberOrg } from "@/server/work-helpers";
import type { AccountView, ActionResult } from "@/lib/personal-types";

export async function getAccount(): Promise<AccountView> {
  const { profile, session } = await requireUser();
  const [row] = await db.select().from(profiles).where(eq(profiles.id, profile.id)).limit(1);
  const [unread] = await db
    .select({ n: count() })
    .from(notifications)
    .where(and(eq(notifications.profileId, profile.id), isNull(notifications.readAt)));
  return {
    name: row.name,
    email: session.user.email,
    phone: row.phone,
    createdAt: row.createdAt.toISOString(),
    smsAlerts: row.smsAlerts,
    promotions: row.promotions,
    language: row.language,
    twoFactorEnabled: Boolean(session.user.twoFactorEnabled),
    unreadNotifications: unread?.n ?? 0,
  };
}

export async function updateSettings(input: { smsAlerts?: boolean; promotions?: boolean }): Promise<ActionResult> {
  const { profile } = await requireUser();
  const patch: { smsAlerts?: boolean; promotions?: boolean } = {};
  if (typeof input.smsAlerts === "boolean") patch.smsAlerts = input.smsAlerts;
  if (typeof input.promotions === "boolean") patch.promotions = input.promotions;
  if (Object.keys(patch).length === 0) return { ok: true };
  await db.update(profiles).set(patch).where(eq(profiles.id, profile.id));
  return { ok: true };
}

/** Change password for the signed-in user (BetterAuth checks the current one). */
export async function changePassword(input: { currentPassword: string; newPassword: string }): Promise<ActionResult> {
  await requireUser();
  if (input.newPassword.length < 8 || input.newPassword.length > 128) {
    return { ok: false, error: "Password must be 8 to 128 characters." };
  }
  try {
    await auth.api.changePassword({
      body: { currentPassword: input.currentPassword, newPassword: input.newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Your current password is not correct." };
  }
}

/** Name of the company the signed-in staff member belongs to, if any. */
export async function getCompanyName(): Promise<string | null> {
  const { profile } = await requireUser();
  const org = await memberOrg(profile.id);
  return org?.name ?? null;
}
