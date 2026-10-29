import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { emailConfigured, sendEmail } from "@/server/email";
import type { AppRole } from "@/lib/role-routing";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
/** True when Google keys are set; screens can hide "Sign in with Google" otherwise. */
export const googleEnabled = Boolean(googleClientId && googleClientSecret);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    // Only block sign-in on unverified email when we can actually send the link.
    requireEmailVerification: emailConfigured,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Taxi Tap password",
        text: `Use this link to set a new password:\n${url}\n\nIf you did not ask for this, ignore this email.`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your Taxi Tap account",
        text: `Welcome to Taxi Tap. Confirm your email address:\n${url}`,
      });
    },
  },
  socialProviders: googleEnabled
    ? { google: { clientId: googleClientId!, clientSecret: googleClientSecret! } }
    : {},
  plugins: [
    // Two-factor by emailed one-time code (screens: /two-factor, toggle on /profile).
    twoFactor({
      issuer: "Taxi Tap",
      skipVerificationOnEnable: true,
      otpOptions: {
        period: 5,
        sendOTP: async ({ user, otp }) => {
          await sendEmail({
            to: user.email,
            subject: "Your Taxi Tap verification code",
            text: `Your code is ${otp}. It expires in 5 minutes.`,
          });
        },
      },
    }),
    nextCookies(), // keep last
  ],
});

export type Role = AppRole;

export type Profile = { id: string; name: string; role: Role };

/** The app profile (role) for a BetterAuth user id, or null if none exists yet. */
export async function getProfileForUser(authUserId: string): Promise<Profile | null> {
  const [row] = await db
    .select({ id: profiles.id, name: profiles.name, role: profiles.role })
    .from(profiles)
    .where(eq(profiles.authUserId, authUserId))
    .limit(1);
  return row ?? null;
}

/**
 * Same as getProfileForUser, but creates a customer profile for a user who has
 * none (for example someone who signed in with Google for the first time).
 */
export async function ensureProfile(authUserId: string, name: string): Promise<Profile> {
  await db
    .insert(profiles)
    .values({ authUserId, name: name || "Taxi Tap user" })
    .onConflictDoNothing({ target: profiles.authUserId });
  const profile = await getProfileForUser(authUserId);
  if (!profile) throw new Error("Could not create profile");
  return profile;
}

/** Use at the top of every server action. Throws if not signed in. */
export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not signed in");
  const profile = await ensureProfile(session.user.id, session.user.name);
  return { session, profile };
}

/** Use when an action is limited to certain roles. */
export async function requireRole(...roles: Role[]) {
  const ctx = await requireUser();
  if (!roles.includes(ctx.profile.role)) throw new Error("Not allowed");
  return ctx;
}
