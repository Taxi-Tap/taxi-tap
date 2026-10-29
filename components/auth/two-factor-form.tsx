"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { getAuthProfile } from "@/app/auth-actions";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Field, inputClass, primaryButtonClass } from "@/components/auth/field";
import { LoadingScreen } from "@/components/auth/loading-screen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import { homeForRole } from "@/lib/role-routing";

/**
 * Second step of sign-in for accounts with two-factor on. BetterAuth has already
 * set a short-lived cookie; we ask it to email a code, then verify it here.
 * "Use a recovery code" switches to a backup code.
 */
export function TwoFactorForm({ maskedEmail }: { maskedEmail: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const sentOnce = useRef(false);

  async function send(isResend: boolean) {
    setError("");
    const { error: sendError } = await authClient.twoFactor.sendOtp();
    if (sendError) {
      setError("We could not send a code. Go back and sign in again.");
      return;
    }
    if (isResend) setNotice("We sent you a new code.");
  }

  useEffect(() => {
    // Send the first code when the screen opens (guard against StrictMode's double effect).
    if (sentOnce.current) return;
    sentOnce.current = true;
    void send(false);
  }, []);

  async function finish() {
    setRedirecting(true);
    const profile = await getAuthProfile();
    router.replace(profile ? homeForRole(profile.role) : "/");
    router.refresh();
  }

  async function handleVerify(event?: FormEvent) {
    event?.preventDefault();
    setNotice("");
    if (!code.trim()) {
      setError(useBackup ? "Enter a recovery code" : "Enter the 6-digit code");
      return;
    }
    if (!useBackup && code.length < 6) {
      setError("Enter all 6 digits");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { error: verifyError } = useBackup
        ? await authClient.twoFactor.verifyBackupCode({ code: code.trim() })
        : await authClient.twoFactor.verifyOtp({ code });
      if (verifyError) {
        setError(useBackup ? "That recovery code is not valid." : "That code is not valid or has expired.");
        return;
      }
      await finish();
    } catch {
      setRedirecting(false);
      setError("We could not verify the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (redirecting) return <LoadingScreen />;

  return (
    <AuthScreen
      barTitle="Sign in"
      title="Two Factor Authentication"
      description={maskedEmail ? `We sent a code to your email ${maskedEmail}` : "We sent a code to your email address."}
      backHref="/sign-in"
      footer={
        <p>
          Didn&apos;t get the code?{" "}
          <button type="button" onClick={() => send(true)} className="font-semibold underline underline-offset-4">
            Resend
          </button>
        </p>
      }
    >
      <form onSubmit={handleVerify} noValidate className="flex flex-1 flex-col gap-5">
        <Field
          id="otp"
          label={useBackup ? "Recovery code" : "Verification code"}
          error={error}
          action={
            <button
              type="button"
              onClick={() => {
                setUseBackup((v) => !v);
                setCode("");
                setError("");
              }}
              className="text-sm font-medium underline-offset-4 hover:underline"
            >
              {useBackup ? "Use an email code" : "Use a recovery code"}
            </button>
          }
        >
          {useBackup ? (
            <Input id="otp" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} aria-invalid={Boolean(error)} className={inputClass} />
          ) : (
            <InputOTP
              id="otp"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={setCode}
              onComplete={() => void handleVerify()}
              aria-invalid={Boolean(error)}
              containerClassName="gap-2"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="size-12" />
                <InputOTPSlot index={1} className="size-12" />
                <InputOTPSlot index={2} className="size-12" />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="size-12" />
                <InputOTPSlot index={4} className="size-12" />
                <InputOTPSlot index={5} className="size-12" />
              </InputOTPGroup>
            </InputOTP>
          )}
        </Field>
        {notice ? (
          <Alert role="status">
            <AlertDescription>{notice}</AlertDescription>
          </Alert>
        ) : null}
        <div className="mt-auto pt-8">
          <Button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            Verify
          </Button>
        </div>
      </form>
    </AuthScreen>
  );
}
