"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { resetPassword } from "@/server/auth-actions";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Field, inputClass, primaryButtonClass } from "@/components/auth/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateResetPasswordForm } from "@/lib/auth-validation";

export function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const validationErrors = validateResetPasswordForm({ token, newPassword, confirmPassword });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setBusy(true);
    try {
      const result = await resetPassword({ token, newPassword });
      if (result.ok) setDone(true);
      else setMessage("This reset link may be invalid or expired. Request a new one and try again.");
    } catch {
      setMessage("We could not reset your password. Request a new link and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <AuthScreen barTitle="Reset password" title="Password updated" description="You can now sign in with your new password." hideBack>
        <CheckCircle2 className="mb-6 size-10 text-emerald-600" aria-hidden="true" />
        <Button className={primaryButtonClass} render={<Link href="/sign-in" />} nativeButton={false}>
          Sign in
        </Button>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      barTitle="Reset password"
      title="Reset password"
      description="Choose a new password for your account."
      backHref="/sign-in"
    >
      {token ? (
        <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-5">
          <Field id="newPassword" label="New password" error={errors.newPassword} hint="At least 8 characters.">
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              aria-invalid={Boolean(errors.newPassword)}
              aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
              className={inputClass}
            />
          </Field>
          <Field id="confirmPassword" label="Confirm new password" error={errors.confirmPassword}>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
              className={inputClass}
            />
          </Field>
          {message ? (
            <Alert variant="destructive" role="alert">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          ) : null}
          <div className="mt-auto pt-8">
            <Button type="submit" disabled={busy} className={primaryButtonClass}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              {busy ? "Resetting…" : "Reset password"}
            </Button>
          </div>
        </form>
      ) : (
        <Alert variant="destructive" role="alert">
          <AlertDescription>
            This reset link is missing its token.{" "}
            <Link href="/forgot-password" className="font-semibold underline">
              Request a new link
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}
    </AuthScreen>
  );
}
