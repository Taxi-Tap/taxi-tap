"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Check, Loader2, RefreshCw, X } from "lucide-react";
import { createQrToken, getQrStatus, type MyCode } from "@/server/qr";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Result = { ok: boolean; txId?: string; reason?: string } | null;

/**
 * "Show my code": a signed QR that lasts 60 seconds and refreshes itself, with the short code
 * underneath for readers whose camera cannot scan. Shows the result as soon as it is used.
 */
export function ShowCode() {
  const [qr, setQr] = useState<MyCode | null>(null);
  const [image, setImage] = useState("");
  const [left, setLeft] = useState(60);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result>(null);
  const resultRef = useRef<Result>(null);

  const refresh = useCallback(async () => {
    setError("");
    try {
      const r = await createQrToken();
      if (!r.ok) return setError(r.error);
      setQr(r.qr);
      setImage(await QRCode.toDataURL(r.qr.token, { margin: 1, width: 288, errorCorrectionLevel: "L" }));
    } catch {
      setError("We could not make a code. Check your connection and try again.");
    }
  }, []);

  useEffect(() => {
    // Fetch the first code when the screen opens; later ones come from the timer below.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading the code is the point of opening this screen
    void refresh();
  }, [refresh]);

  // Countdown and automatic refresh a few seconds before the code expires.
  useEffect(() => {
    if (!qr || result) return;
    const tick = setInterval(() => {
      const secs = Math.max(0, Math.round((qr.expiresAt - Date.now()) / 1000));
      setLeft(secs);
      if (secs <= 8) void refresh();
    }, 1000);
    return () => clearInterval(tick);
  }, [qr, result, refresh]);

  // Ask the server whether the reader has used this code yet.
  useEffect(() => {
    if (!qr || result) return;
    const poll = setInterval(async () => {
      try {
        const s = await getQrStatus(qr.nonce);
        if (s.used && !resultRef.current) {
          const r = { ok: !s.failed, txId: s.txId, reason: s.failed };
          resultRef.current = r;
          setResult(r);
        }
      } catch {
        // Try again on the next tick.
      }
    }, 2000);
    return () => clearInterval(poll);
  }, [qr, result]);

  function again() {
    resultRef.current = null;
    setResult(null);
    setQr(null);
    setImage("");
    void refresh();
  }

  if (result) {
    return (
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center px-4 pb-8 pt-16 text-center">
        <div className={`flex size-28 items-center justify-center rounded-full text-white ${result.ok ? "bg-green-500" : "bg-red-500"}`}>
          {result.ok ? <Check className="size-14" aria-hidden="true" /> : <X className="size-14" aria-hidden="true" />}
        </div>
        <p role="status" className="mt-8 text-lg font-bold">{result.ok ? "Payment sent" : "Payment failed"}</p>
        {result.reason ? <p className="mt-1 text-sm text-muted-foreground">{result.reason}</p> : null}
        <div className="mt-auto flex w-full gap-3 pt-10">
          {result.txId ? (
            <Button variant="outline" className="h-11 flex-1 rounded-full font-semibold" render={<Link href={`/history/${result.txId}`} />} nativeButton={false}>
              View receipt
            </Button>
          ) : null}
          <Button className="h-11 flex-1 rounded-full font-semibold" onClick={again}>
            Show a new code
          </Button>
        </div>
      </div>
    );
  }

  const code = qr ? `${qr.code.slice(0, 4)}-${qr.code.slice(4)}` : "";
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center px-4 pb-8 pt-8 text-center">
      <p>Show this to the driver or shop</p>
      <div className="mt-6 flex size-72 items-center justify-center rounded-3xl border-2 p-2">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- generated data URL
          <img src={image} alt="Your payment QR code" className="size-full" />
        ) : (
          <Loader2 className="size-8 animate-spin text-muted-foreground" aria-label="Making your code" />
        )}
      </div>
      <p className="mt-5 text-xs text-muted-foreground">Or read out this code</p>
      <p className="mt-1 font-mono text-3xl font-bold tracking-[0.2em]" aria-label={`Code ${qr?.code.split("").join(" ") ?? ""}`}>
        {code || "••••-••••"}
      </p>
      <p className="mt-3 text-xs text-muted-foreground" aria-live="off">
        New code in {left}s {"·"} works once
      </p>
      {error ? (
        <Alert variant="destructive" role="alert" className="mt-4 text-left">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button variant="ghost" className="mt-auto" onClick={again}>
        <RefreshCw /> New code now
      </Button>
    </div>
  );
}
