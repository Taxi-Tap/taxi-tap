"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { requestPasswordReset } from "@/server/auth-actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField, inputClassName } from "@/components/auth/form-field";
import { validateEmailForm } from "@/lib/auth-validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);
    const validationErrors = validateEmailForm({ email });
    setError(validationErrors.email ?? "");
    if (Object.keys(validationErrors).length > 0) return;

    setBusy(true);
    try {
      const result = await requestPasswordReset({ email });
      if (result.ok) {
        setSuccess(true);
      } else {
        setError("We could not send a reset link right now. Please try again.");
      }
    } catch {
      setError("We could not send a reset link right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Forgot password?" description="Enter your email and we’ll help you reset your password.">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField id="email" label="Email" error={error}>
          <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className={inputClassName} aria-invalid={Boolean(error)} aria-describedby={error ? "email-error" : undefined} />
        </FormField>
        {success ? (
          <p role="status" className="rounded-xl bg-purple-50 p-3 text-sm leading-5 text-purple-950">
            If an account exists for that email, a reset link has been generated. Reset links print in the development server console for now.
          </p>
        ) : null}
        <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-black px-4 font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
          {busy ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/sign-in" className="font-semibold text-[#6D28D9] underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
