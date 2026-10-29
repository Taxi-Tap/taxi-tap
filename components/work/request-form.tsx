"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createPaymentRequest } from "@/server/merchant";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { rands } from "@/lib/format";
import { randsToCents } from "@/lib/money";

const PRESETS = [20, 50, 100, 200];

export function RequestForm() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  let cents = 0;
  try {
    cents = amount ? randsToCents(amount) : 0;
  } catch {
    cents = 0;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (cents < 100) return setError("Enter an amount of at least R1.00.");
    setBusy(true);
    try {
      const r = await createPaymentRequest(cents);
      if (!r.ok) return setError(r.error);
      router.push(`/request/${r.request.id}`);
    } catch {
      setError("We could not create the request. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex min-h-[calc(100dvh-8.5rem)] flex-col px-4 pt-6">
      <p className="text-center text-muted-foreground">Amount to request</p>
      <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-muted py-5">
        <label htmlFor="amount" className="text-4xl font-bold">R</label>
        <input
          id="amount"
          inputMode="decimal"
          autoFocus
          value={amount}
          placeholder="0.00"
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="w-40 bg-transparent text-4xl font-bold outline-none placeholder:text-muted-foreground/60"
          aria-label="Amount in rands"
        />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Quick amounts">
        {PRESETS.map((p) => (
          <button key={p} type="button" onClick={() => setAmount(String(p))} className="rounded-full border px-4 py-1.5 text-sm font-semibold">
            R {p}
          </button>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">The customer pays with the code on the next screen. It works for 10 minutes.</p>
      {error ? (
        <Alert variant="destructive" role="alert" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="mt-auto pb-2 pt-8">
        <Button type="submit" disabled={busy} className="h-12 w-full rounded-full text-base font-semibold">
          {busy ? <Loader2 className="animate-spin" /> : null}
          Request {rands(cents)}
        </Button>
      </div>
    </form>
  );
}
