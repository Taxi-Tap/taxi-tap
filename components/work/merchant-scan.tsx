"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ScanLine, X } from "lucide-react";
import { payMerchant } from "@/server/payments";
import { ScanDialog } from "@/components/scan/scan-dialog";
import { Button } from "@/components/ui/button";
import { playResult } from "@/lib/feedback";
import { rands } from "@/lib/format";
import { randsToCents } from "@/lib/money";
import { timed, type PayTiming } from "@/lib/perf";
import { cn } from "@/lib/utils";

const PRESETS = [20, 50, 100, 200];

function position(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
      () => resolve(null),
      { timeout: 3000, maximumAge: 60_000 },
    );
  });
}

export function MerchantScan() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<{ ok: boolean; text: string } | null>(null);
  const [timing, setTiming] = useState<PayTiming | null>(null);

  let cents = 0;
  try {
    cents = amount ? randsToCents(amount) : 0;
  } catch {
    cents = 0;
  }

  async function charge(credential: string) {
    setBusy(true);
    setOutcome(null);
    try {
      const where = await position();
      const { result, timing: t } = await timed(credential, () => payMerchant({ credential, amountCents: cents, ...(where ?? {}) }));
      setTiming(t);
      const text = result.ok ? `${rands(result.amountCents)} received` : result.error;
      setOutcome({ ok: result.ok, text });
      playResult(result.ok);
      if (result.ok) {
        setAmount("");
        router.refresh();
      }
    } catch {
      setOutcome({ ok: false, text: "Payment failed. Try again." });
      playResult(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-8.5rem)] flex-col px-4 pt-6">
      <p className="text-center text-muted-foreground">Amount to take</p>
      <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-muted py-5">
        <label htmlFor="amount" className="text-4xl font-bold">R</label>
        <input
          id="amount"
          inputMode="decimal"
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

      {outcome ? (
        <div role={outcome.ok ? "status" : "alert"} className={cn("mt-6 flex items-center gap-3 rounded-xl p-4 text-white", outcome.ok ? "bg-green-500" : "bg-red-500")}>
          {outcome.ok ? <Check className="size-6 shrink-0" aria-hidden="true" /> : <X className="size-6 shrink-0" aria-hidden="true" />}
          <p className="text-sm font-semibold">{outcome.text}</p>
        </div>
      ) : null}
      {timing ? (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Code {timing.payloadBytes} bytes {"·"} confirmed in {timing.confirmMs} ms
        </p>
      ) : null}

      <div className="mt-auto space-y-3 pb-2 pt-8">
        <Button onClick={() => setScanning(true)} disabled={busy || cents < 100} className="h-12 w-full rounded-full text-base font-semibold">
          {busy ? <Loader2 className="animate-spin" /> : <ScanLine />}
          Scan customer {cents >= 100 ? rands(cents) : ""}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          No camera or no code on their phone?{" "}
          <Link href="/request" className="font-semibold underline">
            Request a payment code instead
          </Link>
        </p>
      </div>
      <ScanDialog open={scanning} onOpenChange={setScanning} onCredential={(c) => void charge(c)} />
    </div>
  );
}
