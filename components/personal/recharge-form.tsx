"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { rechargeWallet } from "@/server/wallets";
import { AccountRow } from "@/components/personal/virtual-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { rands } from "@/lib/format";
import { randsToCents } from "@/lib/money";
import { cn } from "@/lib/utils";

const PRESETS = [50, 100, 200, 500];

/** Recharge: simulated top-up from demo funds (no real money moves). */
export function RechargeForm({ last4, balanceCents }: { last4: string; balanceCents: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState("100");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const key = useRef(crypto.randomUUID());

  let cents = 0;
  try {
    cents = randsToCents(amount || "0");
  } catch {
    cents = 0;
  }

  async function submit() {
    setError("");
    if (cents < 100) return setError("Enter an amount of at least R1.00.");
    setBusy(true);
    try {
      const result = await rechargeWallet({ amountCents: cents, key: key.current });
      if (!result.ok) return setError(result.error);
      toast.success(`${rands(cents)} added to your wallet`);
      router.push("/wallet");
      router.refresh();
    } catch {
      setError("We could not recharge your wallet. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-8.5rem)] flex-col px-4 pt-6">
      <p className="text-center text-muted-foreground">Recharge amount</p>
      <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-muted py-5">
        <label htmlFor="amount" className="text-4xl font-bold">R</label>
        <input
          id="amount"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
          className="w-40 bg-transparent text-4xl font-bold outline-none"
          aria-label="Recharge amount in rands"
        />
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Quick amounts">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setAmount(String(p))}
            aria-pressed={Number(amount) === p}
            className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold", Number(amount) === p && "bg-black text-white")}
          >
            R {p}
          </button>
        ))}
      </div>
      <p className="mt-8 text-sm">Recharge account</p>
      <div className="mt-2 rounded-xl bg-muted p-2">
        <AccountRow variant="ocean" last4={last4} balanceCents={balanceCents} trailing="none" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Demo mode: funds are simulated and no real money moves.</p>
      {error ? (
        <Alert variant="destructive" role="alert" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="mt-auto pb-2 pt-8">
        <Button onClick={submit} disabled={busy} className="h-12 w-full rounded-full text-base font-semibold">
          {busy ? <Loader2 className="animate-spin" /> : null}
          Recharge {rands(cents)} to wallet
        </Button>
      </div>
    </div>
  );
}
