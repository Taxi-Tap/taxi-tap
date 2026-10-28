"use server";

// Auth server actions for the screens in app/(auth) (screens: TAX-32).
// They return { ok, error } instead of throwing so a form can show the message.
// Navigation is left to the caller: on { ok: true }, call router.push() / redirect().
//
// Screen            -> action
// Sign in           -> signIn({ email, password, rememberMe })
// Sign in w/ Google -> signInWithGoogle()  then  window.location.href = result.url
// Sign up           -> signUp({ name, email, password })
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
  signUpSchema,
  type AuthResult,
  type RequestPasswordResetInput,
  type ResetPasswordInput,
  type SignInInput,
  type SignUpInput,
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

function invalid(error: z.ZodError): AuthResult {
  return {
    ok: false,
    error: "Check the highlighted fields.",
    fieldErrors: z.flattenError(error).fieldErrors,
  };
}

/** Create an account with email + password and sign the user in. */
export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    await auth.api.signUpEmail({ body: parsed.data, headers: await headers() });
    // TODO (after the profiles migration): create the user's `profiles` row and wallet here.
    return { ok: true };
  } catch (err) {
    return failure(err);
  }
}

/** Sign in with email + password. `rememberMe: false` makes it a browser-session cookie. */
export async function signIn(input: SignInInput): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) return invalid(parsed.error);
  try {
    await auth.api.signInEmail({ body: parsed.data, headers: await headers() });
    return { ok: true };
  } catch (err) {
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
