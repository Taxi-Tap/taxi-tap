import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { db } from "@/db";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
/** True when Google keys are set; screens can hide "Sign in with Google" otherwise. */
export const googleEnabled = Boolean(googleClientId && googleClientSecret);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    // Sends the "set a new password" link. No email provider is wired up yet:
    // TODO pick one (e.g. Resend) and send `url` to `user.email`. Until then the
    // link is printed to the server console in development only.
    sendResetPassword: async ({ user, url }) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(`[auth] Password reset link for ${user.email}: ${url}`);
      }
    },
  },
  socialProviders: googleEnabled
    ? { google: { clientId: googleClientId!, clientSecret: googleClientSecret! } }
    : {},
  plugins: [nextCookies()],
});

// Matches the planned role enum in db/schema.ts (TAX-89).
export type Role = "customer" | "driver" | "owner" | "association_admin" | "merchant_staff";

/** Use at the top of every server action. Throws if not signed in. */
export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not signed in");
  // TODO TAX-89: also load the user's row from `profiles` (by auth_user_id) and return it.
  return { session };
}

/** Use when an action is limited to certain roles. */
export async function requireRole(...roles: Role[]) {
  const ctx = await requireUser();
  // TODO TAX-89: read the role from the user's profile once the profiles table exists.
  const role: Role | undefined = undefined;
  if (!role || !roles.includes(role)) throw new Error("Not allowed");
  return ctx;
}
