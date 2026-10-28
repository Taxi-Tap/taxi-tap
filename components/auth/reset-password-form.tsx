"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { resetPassword } from "@/server/auth-actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { FormField, inputClassName } from "@/components/auth/form-field";
import { validateResetPasswordForm } from "@/lib/auth-validation";

export function ResetPasswordForm({ token }: { token: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccess(false);
    const validationErrors = validateResetPasswordForm({
      token,
      newPassword,
      confirmPassword,
    });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setBusy(true);
    try {
      const result = await resetPassword({ token, newPassword });
      if (result.ok) {
        setSuccess(true);
        setMessage("Your password has been reset. You can now sign in.");
      } else {
        setMessage("This reset link may be invalid or expired. Request a new one and try again.");
      }
    } catch {
      setMessage("We could not reset your password. Request a new link and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Reset password" description="Choose a new password for your account.">
      {token ? (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormField id="newPassword" label="New password" error={errors.newPassword}>
            <input id="newPassword" name="newPassword" type="password" autoComplete="new-password" required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputClassName} aria-invalid={Boolean(errors.newPassword)} aria-describedby={errors.newPassword ? "newPassword-error" : undefined} />
          </FormField>
          <FormField id="confirmPassword" label="Confirm new password" error={errors.confirmPassword}>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className={inputClassName} aria-invalid={Boolean(errors.confirmPassword)} aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined} />
          </FormField>
          <p className="text-sm text-neutral-600">Reset links print in the development server console for now.</p>
          {message ? <p role={success ? "status" : "alert"} className={success ? "text-sm font-medium text-green-800" : "text-sm font-medium text-red-700"}>{message}</p> : null}
          {!success ? (
            <button type="submit" disabled={busy} className="min-h-12 w-full rounded-xl bg-black px-4 font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
              {busy ? "Resetting…" : "Reset password"}
            </button>
          ) : null}
        </form>
      ) : (
        <p role="alert" className="text-sm text-red-700">
          This reset link is missing its token. Request a new link to continue.
        </p>
      )}
      <p className="mt-6 text-center text-sm">
        <Link href="/sign-in" className="font-semibold text-[#6D28D9] underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
