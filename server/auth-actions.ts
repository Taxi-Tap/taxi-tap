"use server";

// Auth server actions for the screens in app/(auth) (screens: TAX-32).
// They return { ok, error } instead of throwing so a form can show the message.
// Navigation is left to the caller: on { ok: true }, call router.push() / redirect().
//
// Screen            -> action
// Sign in           -> signIn({ email, password, rememberMe })
// Sign in w/ Google -> signInWithGoogle()  then  window.location.href = result.url
// Sign up           -> app/auth-actions.ts (signUpPersonal / signUpBusiness / signUpStaff)
// Forgot password   -> requestPasswordReset({ email })
// New password      -> resetPassword({ token, newPassword })   (token = ?token= in the emailed link)
// Header / guards   -> getCurrentUser(), signOut()

import { headers } from "next/headers";
import { APIError } from "better-auth/api";
import { z } from "zod";
import { auth, googleEnabled } from "@/server/auth";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
  signInSchema,
  type AuthResult,
  type RequestPasswordResetInput,
  type ResetPasswordInput,
  type SignInInput,
} from "@/lib/auth-schemas";

/** Where the emailed reset link sends the user: the screen that calls resetPassword(). */
const RESET_PASSWORD_PAGE = "/reset-password";
/** Where Google sends the user back to after they approve. */
const AFTER_GOOGLE_SIGN_IN = "/wallet";

function failure(err: unknown): AuthResult {
  if (err instanceof APIError) {
    return { ok: false, error: err.body?.message ?? err.message };
  }
  console.error("auth action failed", err);
  return { ok: false, error: "Something went wrong. Please try again." };
}

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  return `${local.slice(0, 1)}${"*".repeat(Math.max(local.length - 1, 2))}@${domain}`;
}

function invalid(error: z.ZodError): AuthResult {
  return {
    ok: false,
    error: "Check the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

/** Sign in with email + password. `rememberMe: false` makes it a browser-session cookie. */
export async function signIn(input: SignInInput): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    const res = await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
    // With two-factor on, BetterAuth sets a short-lived cookie instead of a session.
    if ("twoFactorRedirect" in res && res.twoFactorRedirect) {
      return { ok: true, twoFactor: true, maskedEmail: maskEmail(parsed.data.email) };
    }
    return { ok: true };
  } catch (err) {
    if (err instanceof APIError && err.body?.code === "EMAIL_NOT_VERIFIED") {
      return { ok: false, error: "Verify your email address first.", code: "EMAIL_NOT_VERIFIED" };
    }
    return failure(err);
  }
}

/** Start Google sign-in. On { ok: true }, send the browser to `url`. */
export async function signInWithGoogle(): Promise<AuthResult> {
  if (!googleEnabled) {
    return { ok: false, error: "Google sign-in is not set up yet." };
  }
  try {
    const res = await auth.api.signInSocial({
      body: { provider: "google", callbackURL: AFTER_GOOGLE_SIGN_IN },
      headers: await headers(),
    });
    if (!res.url) return { ok: false, error: "Could not start Google sign-in." };
    return { ok: true, url: res.url };
  } catch (err) {
    return failure(err);
  }
}

/**
 * "Reset your password" screen. Always answers ok for a well-formed email, whether or
 * not an account exists, so the screen can't be used to find out who has an account.
 */
export async function requestPasswordReset(input: RequestPasswordResetInput): Promise<AuthResult> {
  const parsed = requestPasswordResetSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    await auth.api.requestPasswordReset({
      body: { email: parsed.data.email, redirectTo: RESET_PASSWORD_PAGE },
      headers: await headers(),
    });
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

/** Set a new password using the token from the emailed link. */
export async function resetPassword(input: ResetPasswordInput): Promise<AuthResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    await auth.api.resetPassword({ body: parsed.data, headers: await headers() });
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

/** Sign the current user out. */
export async function signOut(): Promise<AuthResult> {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

/** The signed-in user, or null. Safe to call from any screen. */
export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const { id, name, email } = session.user;
  return { id, name, email };
}

/** Which sign-in options exist, so the sign-in screen can hide "Sign in with Google". */
export async function getAuthOptions() {
  return { google: googleEnabled };
}

/** Send the account-verification email again (the "Resend email" button). */
export async function resendVerification(email: string): Promise<AuthResult> {
  const parsed = requestPasswordResetSchema.safeParse({ email });
  if (!parsed.success) return invalid(parsed.error);
  try {
    await auth.api.sendVerificationEmail({
      body: { email: parsed.data.email, callbackURL: "/" },
      headers: await headers(),
    });
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}
