"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePassword, updateSettings } from "@/server/account";
import { Field, inputClass } from "@/components/auth/field";
import { TwoFactorSetting } from "@/components/auth/two-factor-setting";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 px-4" aria-label={title}>
      <h2 className="mb-1 text-xs font-bold">{title}</h2>
      <div className="divide-y">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 py-2">
      <span className="text-base">{label}</span>
      {children}
    </div>
  );
}

export function SettingsPanel(props: { smsAlerts: boolean; promotions: boolean; language: string; twoFactorEnabled: boolean }) {
  const [sms, setSms] = useState(props.smsAlerts);
  const [promo, setPromo] = useState(props.promotions);
  const [pwOpen, setPwOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [pwError, setPwError] = useState("");
  const [busy, setBusy] = useState(false);

  async function toggle(field: "smsAlerts" | "promotions", value: boolean) {
    const set = field === "smsAlerts" ? setSms : setPromo;
    set(value);
    const r = await updateSettings({ [field]: value });
    if (!r.ok) {
      set(!value);
      toast.error("We could not save that setting.");
    }
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    setPwError("");
    if (next.length < 8) return setPwError("New password must be at least 8 characters.");
    setBusy(true);
    try {
      const r = await changePassword({ currentPassword: current, newPassword: next });
      if (!r.ok) return setPwError(r.error);
      toast.success("Password changed");
      setPwOpen(false);
      setCurrent("");
      setNext("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="pb-6">
      <Group title="Settings">
        <button type="button" onClick={() => setPwOpen(true)} className="flex min-h-14 w-full items-center justify-between py-2 text-left text-base">
          Change password <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
        </button>
        <div className="py-3">
          <p className="mb-2 text-base">Two-factor authentication</p>
          <TwoFactorSetting enabled={props.twoFactorEnabled} />
        </div>
      </Group>
      <Group title="Notifications">
        <Row label="Push notifications">
          <span className="text-sm text-muted-foreground">Not available in demo</span>
        </Row>
        <Row label="SMS alerts">
          <Switch checked={sms} onCheckedChange={(v) => toggle("smsAlerts", v)} aria-label="SMS alerts" />
        </Row>
        <Row label="Promotions">
          <Switch checked={promo} onCheckedChange={(v) => toggle("promotions", v)} aria-label="Promotions" />
        </Row>
      </Group>
      <Group title="General">
        <Row label="Language">
          <span className="text-sm text-muted-foreground">{props.language}</span>
        </Row>
      </Group>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <form onSubmit={submitPassword} noValidate className="space-y-4">
            <DialogHeader>
              <DialogTitle>Change password</DialogTitle>
              <DialogDescription>You will be signed out of your other devices.</DialogDescription>
            </DialogHeader>
            <Field id="current" label="Current password">
              <Input id="current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
            </Field>
            <Field id="new" label="New password" error={pwError} hint="At least 8 characters.">
              <Input id="new" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
            </Field>
            <DialogFooter>
              <Button type="submit" disabled={busy || !current || !next}>
                {busy ? <Loader2 className="animate-spin" /> : null}
                Change password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
