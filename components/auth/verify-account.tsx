"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { resendVerification } from "@/server/auth-actions";
import { AuthScreen } from "@/components/auth/auth-screen";
import { primaryButtonClass } from "@/components/auth/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/** "Verify account": the sign-up / sign-in screen for an address that is not confirmed yet. */
export function VerifyAccount({ email }: { email: string }) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  async function resend() {
    setBusy(true);
    setNotice(null);
    try {
      const result = await resendVerification(email);
      setNotice(
        result.ok
          ? { ok: true, text: "We sent a new verification email." }
          : { ok: false, text: "We could not send the email. Please try again." },
      );
    } catch {
      setNotice({ ok: false, text: "We could not send the email. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen
      barTitle="Sign in"
      title="Verify account"
      description={
        email ? (
          <>
            We sent an activation link to <strong className="text-foreground">{email}</strong>. Open it to
            finish setting up your account.
          </>
        ) : (
          "We sent an activation link to your email address. Open it to finish setting up your account."
        )
      }
      backHref="/sign-in"
      footer={
        <p>
          Wrong address?{" "}
          <Link href="/sign-up" className="font-semibold underline underline-offset-4">
            Sign up again
          </Link>
        </p>
      }
    >
      <div className="space-y-3">
        {notice ? (
          <Alert variant={notice.ok ? "default" : "destructive"} role={notice.ok ? "status" : "alert"}>
            <AlertDescription>{notice.text}</AlertDescription>
          </Alert>
        ) : null}
        <Button type="button" onClick={resend} disabled={busy || !email} className={primaryButtonClass}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          Resend email
        </Button>
        <Button variant="outline" className={primaryButtonClass} render={<Link href="/sign-in" />} nativeButton={false}>
          Back to sign in
        </Button>
      </div>
    </AuthScreen>
  );
}
