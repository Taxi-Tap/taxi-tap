"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Field, inputClass } from "@/components/auth/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Turn email two-factor on or off. BetterAuth asks for the account password to confirm. */
export function TwoFactorSetting({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!password) return setError("Enter your password to confirm");
    setBusy(true);
    setError("");
    try {
      if (enabled) {
        const { error: e } = await authClient.twoFactor.disable({ password });
        if (e) return setError("That password is not correct.");
      } else {
        const { error: e } = await authClient.twoFactor.enable({ password });
        if (e) return setError("That password is not correct, or this account has no password (for example Google sign-in).");
        const { data } = await authClient.twoFactor.generateBackupCodes({ password });
        setBackupCodes(data?.backupCodes ?? []);
      }
      setOpen(false);
      setPassword("");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        {enabled ? <ShieldCheck className="size-4 text-emerald-600" aria-hidden="true" /> : <ShieldOff className="size-4 text-muted-foreground" aria-hidden="true" />}
        <span className="font-medium">{enabled ? "On" : "Off"}</span>
      </div>

      {backupCodes.length > 0 ? (
        <Alert role="status">
          <AlertDescription>
            <p className="font-medium">Save these recovery codes. Each works once if you cannot get an email code.</p>
            <ul className="mt-2 grid grid-cols-2 gap-1 font-mono text-sm">
              {backupCodes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}

      {open ? (
        <form onSubmit={submit} noValidate className="max-w-sm space-y-4">
          <Field id="tf-password" label="Confirm your password" error={error}>
            <Input id="tf-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={Boolean(error)} className={inputClass} />
          </Field>
          <div className="flex gap-2">
            <Button type="submit" disabled={busy} variant={enabled ? "destructive" : "default"}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              {enabled ? "Turn off" : "Turn on"}
            </Button>
            <Button type="button" variant="outline" onClick={() => { setOpen(false); setError(""); setPassword(""); }}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button type="button" variant="outline" onClick={() => { setOpen(true); setBackupCodes([]); }}>
          {enabled ? "Turn off two-factor" : "Turn on two-factor"}
        </Button>
      )}
    </div>
  );
}
