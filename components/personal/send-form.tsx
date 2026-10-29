"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserSearch } from "lucide-react";
import { toast } from "sonner";
import { lookupRecipient, sendMoney } from "@/server/wallets";
import { Field, inputClass } from "@/components/auth/field";
import { AccountRow } from "@/components/personal/virtual-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { rands } from "@/lib/format";
import { randsToCents } from "@/lib/money";

/** Send / Transfer: move demo funds to another Taxi Tap wallet by email or phone number. */
export function SendForm({
  last4,
  balanceCents,
  recent = [],
  label = "Send",
}: {
  last4: string;
  balanceCents: number;
  recent?: { name: string; to: string }[];
  label?: string;
}) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const [recipient, setRecipient] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const key = useRef(crypto.randomUUID());

  let cents = 0;
  try {
    cents = amount ? randsToCents(amount) : 0;
  } catch {
    cents = 0;
  }

  async function find() {
    setError("");
    setRecipient("");
    const r = await lookupRecipient(to);
    if (r.ok) setRecipient(r.name);
    else setError(r.error);
  }

  async function submit() {
    setError("");
    if (cents < 100) return setError("Enter an amount of at least R1.00.");
    if (cents > balanceCents) return setError("You do not have enough funds. Recharge your wallet first.");
    if (!to.trim()) return setError("Enter who to send to.");
    setBusy(true);
    try {
      const r = await sendMoney({ to, amountCents: cents, note, key: key.current });
      if (!r.ok) return setError(r.error);
      toast.success(`${rands(cents)} sent`);
      router.push(`/history/${r.txId}`);
      router.refresh();
    } catch {
      setError("We could not send the money. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-8.5rem)] flex-col gap-5 px-4 pt-4">
      <div>
        <p className="mb-2 text-sm">{label === "Transfer" ? "From" : "Account"}</p>
        <div className="rounded-xl bg-muted p-2">
          <AccountRow last4={last4} balanceCents={balanceCents} trailing="none" />
        </div>
      </div>
      <Field id="amount" label="Amount">
        <Input id="amount" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} className={inputClass} />
      </Field>
      <Field id="to" label="To" hint={recipient ? `Sending to ${recipient}` : "Their Taxi Tap email or phone number"}>
        <div className="flex gap-2">
          <Input id="to" value={to} onChange={(e) => { setTo(e.target.value); setRecipient(""); }} autoComplete="off" className={inputClass} />
          <Button type="button" variant="outline" size="icon-lg" className="size-12 shrink-0 rounded-lg" aria-label="Check recipient" onClick={find} disabled={!to.trim()}>
            <UserSearch />
          </Button>
        </div>
      </Field>
      {recent.length > 0 ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Recent recipients">
          {recent.map((r) => (
            <button key={r.to} type="button" onClick={() => { setTo(r.to); setRecipient(r.name); }} className="rounded-full border px-3 py-1 text-sm">
              {r.name}
            </button>
          ))}
        </div>
      ) : null}
      <Field id="note" label="Reference">
        <Input id="note" value={note} maxLength={100} onChange={(e) => setNote(e.target.value)} className={inputClass} />
      </Field>
      {error ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="mt-auto pb-2 pt-4">
        <Button onClick={submit} disabled={busy} className="h-12 w-full rounded-full text-base font-semibold">
          {busy ? <Loader2 className="animate-spin" /> : null}
          {label} {rands(cents)}
        </Button>
      </div>
    </div>
  );
}
