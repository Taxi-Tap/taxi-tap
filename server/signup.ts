import { randomInt } from "node:crypto";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth, ensureProfile, getProfileForUser, type Profile } from "@/server/auth";
import { emailConfigured } from "@/server/email";
import { db } from "@/db";
import { user } from "@/db/auth-schema";
import { memberships, organisations, profiles, wallets } from "@/db/schema";
import {
  normalizeCompanyCode,
  registerBusinessSchema,
  registerPersonalSchema,
  registerStaffSchema,
  type RegisterBusinessInput,
  type RegisterPersonalInput,
  type RegisterStaffInput,
} from "@/lib/auth-validation";
import type { AppRole } from "@/lib/role-routing";

export type SignedInProfile = Profile;

export type RegisterResult =
  | { ok: true; role: AppRole; needsVerification: boolean; email: string; joinCode?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

/** Role given to whoever creates a company of each type. */
const ROLE_FOR_NEW_ORG = {
  association: "association_admin",
  business: "owner",
  merchant: "merchant_staff",
} as const satisfies Record<string, AppRole>;

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function newJoinCode() {
  let code = "";
  for (let i = 0; i < 9; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return code;
}

export async function getSignedInProfile(): Promise<SignedInProfile | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return (
    (await getProfileForUser(session.user.id)) ??
    ensureProfile(session.user.id, session.user.name)
  );
}

function invalid(error: z.ZodError): RegisterResult {
  return {
    ok: false,
    error: "Check the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

/** Creates the BetterAuth user (and a session, unless email verification is required). */
async function createAuthUser(input: {
  name: string;
  surname: string;
  email: string;
  password: string;
}) {
  const res = await auth.api.signUpEmail({
    body: {
      name: `${input.name} ${input.surname}`.trim(),
      email: input.email,
      password: input.password,
      callbackURL: "/",
    },
    headers: await headers(),
  });
  return res.user;
}

function failure(err: unknown): RegisterResult {
  if (err instanceof APIError) {
    return { ok: false, error: err.body?.message ?? err.message };
  }
  console.error("sign-up failed", err);
  return { ok: false, error: "We could not create your account. Please try again." };
}

async function discardUser(userId: string) {
  // Roll back the auth user if the rest of sign-up failed, so the email can be reused.
  await db.delete(user).where(eq(user.id, userId)).catch(() => {});
}

export async function registerPersonal(input: RegisterPersonalInput): Promise<RegisterResult> {
  const parsed = registerPersonalSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;
  let authUser;
  try {
    authUser = await createAuthUser(v);
  } catch (err) {
    return failure(err);
  }
  try {
    await db.transaction(async (tx) => {
      const [profile] = await tx
        .insert(profiles)
        .values({ authUserId: authUser.id, name: authUser.name, phone: v.phone || null, role: "customer" })
        .returning({ id: profiles.id });
      // Every account starts with one virtual card (a wallet).
      await tx.insert(wallets).values({ ownerType: "profile", ownerId: profile.id });
    });
    return { ok: true, role: "customer", needsVerification: emailConfigured, email: v.email };
  } catch (err) {
    await discardUser(authUser.id);
    return failure(err);
  }
}

export async function registerBusiness(input: RegisterBusinessInput): Promise<RegisterResult> {
  const parsed = registerBusinessSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;

  const [taken] = await db
    .select({ id: organisations.id })
    .from(organisations)
    .where(eq(organisations.slug, v.slug))
    .limit(1);
  if (taken) {
    return {
      ok: false,
      error: "That company link is already taken.",
      fieldErrors: { slug: ["That company link is already taken"] },
    };
  }

  let authUser;
  try {
    authUser = await createAuthUser(v);
  } catch (err) {
    return failure(err);
  }
  const role = ROLE_FOR_NEW_ORG[v.orgType];
  const joinCode = newJoinCode();
  try {
    await db.transaction(async (tx) => {
      const [profile] = await tx
        .insert(profiles)
        .values({ authUserId: authUser.id, name: authUser.name, phone: v.phone || null, role })
        .returning({ id: profiles.id });
      const [org] = await tx
        .insert(organisations)
        .values({
          name: v.companyName,
          type: v.orgType,
          slug: v.slug,
          logoUrl: v.logo || null,
          location: v.location,
          joinCode,
        })
        .returning({ id: organisations.id });
      await tx.insert(memberships).values({ profileId: profile.id, organisationId: org.id, role });
      await tx.insert(wallets).values([
        { ownerType: "profile", ownerId: profile.id },
        { ownerType: "organisation", ownerId: org.id },
      ]);
    });
    return { ok: true, role, needsVerification: emailConfigured, email: v.email, joinCode };
  } catch (err) {
    await discardUser(authUser.id);
    return failure(err);
  }
}

/** The company a join code belongs to, or null. */
export async function findCompanyByCode(code: string) {
  const normalized = normalizeCompanyCode(code);
  if (normalized.length !== 9) return null;
  const [org] = await db
    .select({ id: organisations.id, name: organisations.name, type: organisations.type })
    .from(organisations)
    .where(eq(organisations.joinCode, normalized))
    .limit(1);
  return org ?? null;
}

export async function registerStaff(input: RegisterStaffInput): Promise<RegisterResult> {
  const parsed = registerStaffSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  const v = parsed.data;

  const org = await findCompanyByCode(v.code);
  if (!org) {
    return {
      ok: false,
      error: "We could not find a company with that code.",
      fieldErrors: { code: ["Company code not found"] },
    };
  }
  // Drivers belong to taxi businesses and associations; merchant staff to merchants.
  if (v.role === "driver" && org.type === "merchant") {
    return { ok: false, error: "Drivers cannot join a merchant company.", fieldErrors: { role: ["Choose another role"] } };
  }
  if (v.role === "merchant_staff" && org.type !== "merchant") {
    return { ok: false, error: "Only merchant companies have merchant staff.", fieldErrors: { role: ["Choose another role"] } };
  }

  let authUser;
  try {
    authUser = await createAuthUser(v);
  } catch (err) {
    return failure(err);
  }
  try {
    await db.transaction(async (tx) => {
      const [profile] = await tx
        .insert(profiles)
        .values({ authUserId: authUser.id, name: authUser.name, phone: v.phone || null, role: v.role })
        .returning({ id: profiles.id });
      await tx.insert(memberships).values({ profileId: profile.id, organisationId: org.id, role: v.role });
      await tx.insert(wallets).values({ ownerType: "profile", ownerId: profile.id });
    });
    return { ok: true, role: v.role, needsVerification: emailConfigured, email: v.email };
  } catch (err) {
    await discardUser(authUser.id);
    return failure(err);
  }
}
