import { z } from "zod";

// Shared by the server actions in server/auth-actions.ts and by forms that
// want to validate on the client before calling them.

const email = z.email("Enter a valid email address").transform((e) => e.toLowerCase());
const newPassword = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters");

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name").max(100),
  email,
  password: newPassword,
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
  /** The "Remember me" checkbox. Off = the session ends when the browser closes. */
  rememberMe: z.boolean().optional(),
});

/** The "Reset your password" screen: just the email. */
export const requestPasswordResetSchema = z.object({ email });

/** The screen the emailed link opens: `token` comes from the link's ?token= value. */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "This reset link is invalid or has expired"),
  newPassword,
});

export type SignUpInput = z.input<typeof signUpSchema>;
export type SignInInput = z.input<typeof signInSchema>;
export type RequestPasswordResetInput = z.input<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.input<typeof resetPasswordSchema>;

/**
 * What every auth action returns, so screens can show errors without try/catch.
 * `url` is only set by signInWithGoogle: send the browser there (window.location.href = url).
 */
export type AuthResult =
  | { ok: true; url?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };
