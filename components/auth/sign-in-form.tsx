"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn, signInWithGoogle } from "@/server/auth-actions";
import { getAuthProfile } from "@/app/auth-actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField, inputClassName } from "@/components/auth/form-field";
import { homeForRole } from "@/lib/role-routing";
import { validateSignInForm } from "@/lib/auth-validation";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const validationErrors = validateSignInForm({ email, password, rememberMe });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setBusy(true);
    try {
      const result = await signIn({ email, password, rememberMe });
      if (!result.ok) {
        setMessage("Email or password is incorrect. Check your details and try again.");
        return;
      }
      const profile = await getAuthProfile();
      if (!profile) {
        setMessage("We could not load your account role. Please contact support.");
        return;
      }
      router.replace(homeForRole(profile.role));
      router.refresh();
    } catch {
      setMessage("We could not sign you in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSignIn() {
    setMessage("");
    setBusy(true);
    try {
      const result = await signInWithGoogle();
      if (!result.ok || !result.url) {
        setMessage("Google sign-in is unavailable right now. Try email and password instead.");
        return;
      }
      window.location.assign(result.url);
    } catch {
      setMessage("Google sign-in is unavailable right now. Try email and password instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Welcome Back" description="Sign in to continue to Taxi Tap.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField id="email" label="Email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClassName}
          />
        </FormField>
        <FormField id="password" label="Password" error={errors.password}>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={inputClassName}
          />
        </FormField>
        <div className="flex min-h-12 items-center justify-between gap-3">
          <label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm text-neutral-800">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="size-5 accent-[#6D28D9]"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="flex min-h-12 items-center font-semibold text-[#6D28D9] underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {message ? <p role="alert" className="text-sm font-medium text-red-700">{message}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="min-h-12 w-full rounded-xl bg-black px-4 font-semibold text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex items-center gap-3 text-sm text-neutral-500">
          <span className="h-px flex-1 bg-neutral-200" />
          <span>or</span>
          <span className="h-px flex-1 bg-neutral-200" />
        </div>
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={busy}
          className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 font-semibold text-neutral-900 hover:bg-neutral-50 disabled:opacity-60"
        >
          Sign in with Google
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-neutral-700">
        New to Taxi Tap?{" "}
        <Link href="/sign-up" className="font-semibold text-[#6D28D9] underline-offset-4 hover:underline">
          Create account
        </Link>
      </p>
    </AuthShell>
  );
}
