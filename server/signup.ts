import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { sql } from "drizzle-orm";
import { auth } from "@/server/auth";
import { db } from "@/db";
import { signUpFormSchema, type SignUpFormInput } from "@/lib/auth-validation";
import type { AppRole } from "@/lib/role-routing";

export type SignedInProfile = {
  id: string;
  name: string;
  role: AppRole;
};

export type SignUpProfileResult =
  | { ok: true; role: AppRole }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export async function getSignedInProfile(): Promise<SignedInProfile | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const result = await db.execute<{
    id: string;
    name: string;
    role: AppRole;
  }>(
    sql`SELECT id, name, role FROM profiles WHERE auth_user_id = ${session.user.id} LIMIT 1`,
  );
  return result.rows[0] ?? null;
}

export async function createAccountWithProfile(
  input: SignUpFormInput,
): Promise<SignUpProfileResult> {
  const parsed = signUpFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string") {
        fieldErrors[field] ??= [];
        fieldErrors[field].push(issue.message);
      }
    }
    return { ok: false, error: "Check the highlighted fields.", fieldErrors };
  }

  try {
    const signup = await auth.api.signUpEmail({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
      },
      headers: await headers(),
    });
    await db.execute(
      sql`INSERT INTO profiles (auth_user_id, name, phone, role) VALUES (${signup.user.id}, ${parsed.data.name}, ${parsed.data.phone || null}, ${parsed.data.role})`,
    );
    return { ok: true, role: parsed.data.role };
  } catch (error) {
    if (error instanceof APIError) {
      return { ok: false, error: error.body?.message ?? error.message };
    }
    console.error("account creation failed", error);
    return { ok: false, error: "We could not create your account. Please try again." };
  }
}
