"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn, signInWithGoogle } from "@/server/auth-actions";
import { getAuthProfile } from "@/app/auth-actions";
import { AuthScreen } from "@/components/auth/auth-screen";
import { Field, inputClass, primaryButtonClass } from "@/components/auth/field";
import { LoadingScreen } from "@/components/auth/loading-screen";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { homeForRole } from "@/lib/role-routing";
import { validateSignInForm } from "@/lib/auth-validation";

export function SignInForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

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
        if (result.code === "EMAIL_NOT_VERIFIED") {
          router.push(`/verify?email=${encodeURIComponent(email)}`);
          return;
        }
        setMessage("Email or password is incorrect. Check your details and try again.");
        return;
      }
      if (result.twoFactor) {
        router.push(`/two-factor?to=${encodeURIComponent(result.maskedEmail ?? "")}`);
        return;
      }
      setRedirecting(true);
      const profile = await getAuthProfile();
      if (!profile) {
        setRedirecting(false);
        setMessage("We could not load your account role. Please contact support.");
        return;
      }
      router.replace(homeForRole(profile.role));
      router.refresh();
    } catch {
      setRedirecting(false);
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

  if (redirecting) return <LoadingScreen />;

  return (
    <AuthScreen
      barTitle="Sign in"
      title="Welcome Back"
      description="Enter your email below to sign in to your account."
      backHref="/"
      footer={
        <div className="space-y-4">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="font-semibold underline underline-offset-4">
              Sign up
            </Link>
          </p>
          <p className="text-muted-foreground">
            By clicking sign in, you agree to our Terms &amp; Conditions and Privacy Policy.
          </p>
        </div>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col gap-5">
        <Field id="email" label="Email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={inputClass}
          />
        </Field>
        <Field id="password" label="Password" error={errors.password}>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={inputClass}
          />
        </Field>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
            <Label htmlFor="remember" className="text-sm">
              Remember me
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm font-medium underline-offset-4 hover:underline">
            Forgot password?
          </Link>
        </div>
        {message ? (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        <div className="mt-auto space-y-4 pt-8">
          <Button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? <Loader2 className="animate-spin" /> : null}
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          {googleEnabled ? (
            <>
              <p className="text-center text-sm text-muted-foreground">Or sign in with</p>
              <Button type="button" variant="outline" disabled={busy} onClick={handleGoogleSignIn} className={primaryButtonClass}>
                Sign in with Google
              </Button>
            </>
          ) : null}
        </div>
      </form>
    </AuthScreen>
  );
}
