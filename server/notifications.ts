"use server";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { requireRole } from "@/server/auth";
import type { NotificationView } from "@/lib/personal-types";

export async function listNotifications(): Promise<NotificationView[]> {
  const { profile } = await requireRole("customer");
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.profileId, profile.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
  return rows.map((n) => ({
    id: n.id,
    kind: n.kind,
    title: n.title,
    body: n.body,
    unread: n.readAt === null,
    createdAt: n.createdAt.toISOString(),
  }));
}

export async function markNotificationsRead(): Promise<void> {
  const { profile } = await requireRole("customer");
  await db
    .update(notifications)
    .set({ readAt: sql`now()` })
    .where(and(eq(notifications.profileId, profile.id), isNull(notifications.readAt)));
}
