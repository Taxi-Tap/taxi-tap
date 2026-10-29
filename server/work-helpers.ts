// Helpers shared by the driver and merchant server actions. Not a "use server" file:
// they take arbitrary ids and must not be callable from the browser.

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberships, organisations } from "@/db/schema";

/** The company a staff member belongs to. */
export async function memberOrg(profileId: string) {
  const [row] = await db
    .select({ org: organisations })
    .from(memberships)
    .innerJoin(organisations, eq(organisations.id, memberships.organisationId))
    .where(eq(memberships.profileId, profileId))
    .limit(1);
  return row?.org ?? null;
}

const TZ = "Africa/Johannesburg";

/** Midnight today in South Africa (UTC+2, no daylight saving), as a Date. */
export function startOfToday(now = new Date()) {
  const day = now.toLocaleDateString("en-CA", { timeZone: TZ });
  return new Date(`${day}T00:00:00+02:00`);
}
