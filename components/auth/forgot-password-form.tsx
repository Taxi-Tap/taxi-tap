"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/server/auth-actions";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Field, inputClass, primaryButtonClass } from "@/components/auth/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateEmailForm } from "@/lib/auth-validation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateEmailForm({ email });
    setError(validationErrors.email ?? "");
    if (Object.keys(validationErrors).length > 0) return;

    setBusy(true);
    try {
      const result = await requestPasswordReset({ email });
      if (result.ok) setSent(true);
      else setError("We could not send a reset link right now. Please try again.");
    } catch {
      setError("We could not send a reset link right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <AuthScreen
        barTitle="Reset password"
        title="Check your email"
        description={
          <>
            If an account exists for <strong>{email}</strong>, we sent a link to reset your password.
          </>
        }
        backHref="/sign-in"
      >
        <MailCheck className="mb-6 size-10 text-fuchsia-600" aria-hidden="true" />
        <div className="space-y-3">
          <Button className={primaryButtonClass} render={<Link href="/sign-in" />} nativeButton={false}>
            Back to sign in
          </Button>
          <Button variant="outline" className={primaryButtonClass} onClick={() => setSent(false)}>
            Use a different email
          </Button>
        </div>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      barTitle="Reset password"
      title="Forgot password?"
      description="Enter your email and we will send you a link to reset your password."
      backHref="/sign-in"
      footer={
        <Link href="/sign-in" className="font-semibold underline underline-offset-4">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-5">
        <Field id="email" label="Email" error={error}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "email-error" : undefined}
            className={inputClass}
          />
        </Field>
        <div className="mt-auto pt-8">
          <Button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            {busy ? "Sending…" : "Send reset link"}
          </Button>
        </div>
      </form>
    </AuthScreen>
  );
}
