"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Loader2, X } from "lucide-react";
import { cancelPaymentRequest, simulateCustomerPays } from "@/server/merchant";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { playResult } from "@/lib/feedback";
import { rands } from "@/lib/format";
import type { PaymentRequestView } from "@/lib/work-types";

/** Shows the code, checks every few seconds whether the customer has paid, and lets the merchant cancel. */
export function RequestStatus({ request }: { request: PaymentRequestView }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"cancel" | "demo" | null>(null);
  const [error, setError] = useState("");
  const pending = request.status === "pending";
  const paid = request.status === "paid";

  useEffect(() => {
    if (paid) playResult(true);
  }, [paid]);

  useEffect(() => {
    if (!pending) return;
    const t = setInterval(() => router.refresh(), 3000);
    return () => clearInterval(t);
  }, [pending, router]);

  async function cancel() {
    setBusy("cancel");
    await cancelPaymentRequest(request.id);
    router.push("/request");
  }

  async function demoPay() {
    setBusy("demo");
    setError("");
    try {
      const r = await simulateCustomerPays(request.id);
      if (!r.ok) setError(r.error);
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (request.status === "paid") {
    return (
      <div className="flex min-h-[calc(100dvh-8.5rem)] flex-col items-center px-4 pt-14 text-center">
        <p>Payment of</p>
        <p className="mt-2 text-4xl font-bold">{rands(request.amountCents)}</p>
        <div className="mt-14 flex size-28 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="size-14" aria-hidden="true" />
        </div>
        <p role="status" className="mt-10">Payment received successfully!</p>
        <div className="mt-auto flex w-full gap-3 pt-10">
          <Button variant="outline" className="h-11 flex-1 rounded-full font-semibold" render={<Link href="/sales" />} nativeButton={false}>
            View sales
          </Button>
          <Button className="h-11 flex-1 rounded-full font-semibold" render={<Link href="/request" />} nativeButton={false}>
            New request
          </Button>
        </div>
      </div>
    );
  }

  if (request.status !== "pending") {
    return (
      <div className="flex flex-col items-center px-4 pt-14 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-red-500 text-white">
          <X className="size-10" aria-hidden="true" />
        </span>
        <p role="status" className="mt-6 text-lg font-bold">{request.status === "cancelled" ? "Request cancelled" : "Request expired"}</p>
        <Button className="mt-8 h-12 w-full rounded-full text-base font-semibold" render={<Link href="/request" />} nativeButton={false}>
          New request
        </Button>
      </div>
    );
  }

  const code = `${request.code.slice(0, 3)} ${request.code.slice(3)}`;
  return (
    <div className="flex min-h-[calc(100dvh-8.5rem)] flex-col px-4 pt-8 text-center">
      <p>Ask the customer to pay</p>
      <p className="mt-2 text-4xl font-bold">{rands(request.amountCents)}</p>
      <p className="mt-8 text-sm text-muted-foreground">Their code</p>
      <p className="mt-2 rounded-2xl bg-muted py-6 font-mono text-5xl font-bold tracking-[0.2em]" aria-label={`Code ${request.code.split("").join(" ")}`}>
        {code}
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" /> Waiting for payment. Expires {new Date(request.expiresAt).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Johannesburg" })}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">Customers choose Pay, then Enter a merchant code.</p>
      {error ? (
        <Alert variant="destructive" role="alert" className="mt-4 text-left">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="mt-auto space-y-3 pt-8">
        <Button variant="outline" onClick={demoPay} disabled={busy !== null} className="h-11 w-full rounded-full font-semibold">
          {busy === "demo" ? <Loader2 className="animate-spin" /> : null}
          Demo: simulate customer paying
        </Button>
        <Button variant="secondary" onClick={cancel} disabled={busy !== null} className="h-11 w-full rounded-full bg-neutral-500 font-semibold text-white hover:bg-neutral-600">
          Cancel request
        </Button>
      </div>
    </div>
  );
}
