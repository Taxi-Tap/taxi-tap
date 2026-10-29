"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, QrCode } from "lucide-react";
import { simulateReader } from "@/server/pay";
import { NfcTapButton } from "@/components/nfc/nfc-tap-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Tap / QR scan screens. The camera and the signed-token reader are not wired yet,
 * so a scan or tap asks the server for a simulated reader quote, then goes to confirm.
 */
export function ReaderScreen({ method, bandId, shopId }: { method: "qr" | "nfc"; bandId?: string; shopId?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function proceed() {
    setError("");
    setBusy(true);
    try {
      const r = await simulateReader({ bandId, shopId });
      if (!r.ok) return setError(r.error);
      const q = r.quote;
      const qs = new URLSearchParams({ method, payee: q.payeeWalletId, amount: String(q.amountCents), label: q.label, name: q.payeeName });
      if (q.bandId) qs.set("band", q.bandId);
      router.push(`/pay/confirm?${qs}`);
    } catch {
      setError("We could not reach the reader. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const cancel = (
    <Button variant="secondary" className="h-12 w-full rounded-full bg-neutral-500 text-base font-semibold text-white hover:bg-neutral-600" onClick={() => router.push("/pay")}>
      Cancel
    </Button>
  );

  if (method === "qr") {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-black px-4 pb-8 pt-10 text-white">
        <p className="text-center">Scan the QR code</p>
        <div className="mx-auto mt-8 flex aspect-[1.1] w-full max-w-xs items-center justify-center rounded-[2.5rem] border-2 border-white">
          <QrCode className="size-28" strokeWidth={1.5} aria-hidden="true" />
        </div>
        {error ? (
          <Alert variant="destructive" role="alert" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <div className="mt-auto space-y-3 pt-8">
          <Button onClick={proceed} disabled={busy} className="h-12 w-full rounded-full bg-white text-base font-semibold text-black hover:bg-neutral-200">
            {busy ? <Loader2 className="animate-spin" /> : null}
            Simulate scan
          </Button>
          {cancel}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col px-4 pb-8 pt-10">
      <p className="text-center">Hold your phone near the reader</p>
      <div className="mx-auto mt-8 flex size-48 items-center justify-center rounded-[2rem] bg-black text-white">
        <span className="text-sm font-bold">Tap</span>
      </div>
      <div className="mt-8 flex justify-center">
        <NfcTapButton onResult={() => void proceed()} onError={setError} />
      </div>
      {error ? (
        <Alert variant="destructive" role="alert" className="mt-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="mt-auto pt-8">{cancel}</div>
    </div>
  );
}
