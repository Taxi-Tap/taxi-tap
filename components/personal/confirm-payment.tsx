"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { payReader } from "@/server/pay";
import { AccountRow } from "@/components/personal/virtual-card";
import { SwipeToConfirm } from "@/components/personal/swipe-to-confirm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { rands } from "@/lib/format";
import { cn } from "@/lib/utils";

const TIPS = [0, 500, 1000, 2000];

export function ConfirmPayment(props: {
  method: "qr" | "nfc";
  payeeWalletId: string;
  payeeName: string;
  label: string;
  bandId?: string;
  amountCents: number;
  last4: string;
  balanceCents: number;
}) {
  const router = useRouter();
  const [tip, setTip] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const key = useRef(crypto.randomUUID());
  const total = props.amountCents + tip;
  const short = total > props.balanceCents;

  async function confirm() {
    setError("");
    setBusy(true);
    try {
      const r = await payReader({
        method: props.method,
        payeeWalletId: props.payeeWalletId,
        bandId: props.bandId,
        amountCents: props.amountCents,
        tipCents: tip,
        key: key.current,
      });
      if (!r.ok) return setError(r.error);
      router.replace(`/pay/success?tx=${r.txId}`);
    } catch {
      setError("We could not complete the payment. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col px-4 pb-8 pt-10">
      <p className="text-center">Confirm payment of</p>
      <p className="mx-auto mt-4 rounded-2xl bg-muted px-8 py-3 text-4xl font-bold">{rands(total)}</p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {props.payeeName}
        {props.label && props.label !== props.payeeName ? ` · ${props.label}` : ""}
      </p>
      <div className="mt-2 flex flex-col items-center">
        <button
          type="button"
          onClick={() => setShowTips((v) => !v)}
          aria-expanded={showTips}
          className="inline-flex items-center gap-1 rounded-full bg-neutral-500 px-3 py-1 text-xs font-bold text-white"
        >
          {tip ? `Tip ${rands(tip)}` : "Add tip"} <Plus className="size-3" aria-hidden="true" />
        </button>
        {showTips ? (
          <div role="group" aria-label="Tip amount" className="mt-3 flex gap-2">
            {TIPS.map((t) => (
              <button key={t} type="button" onClick={() => setTip(t)} aria-pressed={tip === t} className={cn("rounded-full border px-3 py-1 text-sm font-semibold", tip === t && "bg-black text-white")}>
                {t === 0 ? "None" : rands(t)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-sm font-bold">Accounts</h2>
        <Plus className="size-5" aria-hidden="true" />
      </div>
      <div className="mt-2 rounded-2xl bg-muted p-2">
        <AccountRow last4={props.last4} balanceCents={props.balanceCents} selected />
      </div>
      {short ? (
        <Alert variant="destructive" role="alert" className="mt-4">
          <AlertDescription>Your balance is too low for this payment. Recharge your wallet first.</AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive" role="alert" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="mt-auto space-y-3 pt-8">
        {busy ? (
          <div className="flex h-14 items-center justify-center rounded-full bg-black text-white" role="status">
            <Loader2 className="animate-spin" /> <span className="ml-2 font-semibold">Paying…</span>
          </div>
        ) : (
          <SwipeToConfirm onConfirm={confirm} disabled={short} />
        )}
        <Button variant="secondary" className="h-12 w-full rounded-full bg-neutral-500 text-base font-semibold text-white hover:bg-neutral-600" onClick={() => router.push("/pay")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
