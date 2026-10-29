"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Minus, Plus, QrCode, Smartphone, X } from "lucide-react";
import { chargeFare, endTrip } from "@/server/driver";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { rands } from "@/lib/format";
import type { ActiveTrip } from "@/lib/work-types";
import { cn } from "@/lib/utils";

type Outcome = { ok: boolean; text: string } | null;

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

/**
 * Charge screen: choose where the passenger is going and how many are paying, then scan or tap.
 * The camera and NFC reader are not wired yet, so each button is a demo that takes the fare from
 * demo funds. The fare goes to the owner company wallet and is stamped with this phone's location.
 */
export function FareReader({ trip }: { trip: ActiveTrip }) {
  const router = useRouter();
  const [bandId, setBandId] = useState(trip.route.bands[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState<"qr" | "nfc" | "end" | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [total, setTotal] = useState(trip.totalCents);
  const band = trip.route.bands.find((b) => b.id === bandId);
  const fare = band ? band.amountCents * qty : 0;
  const keyRef = useRef(crypto.randomUUID());

  async function charge(via: "qr" | "nfc") {
    if (!band) return;
    setBusy(via);
    setOutcome(null);
    try {
      const where = await position();
      const r = await chargeFare({ bandId, quantity: qty, key: keyRef.current, ...(where ?? {}) });
      if (r.ok) {
        keyRef.current = crypto.randomUUID(); // next passenger is a new payment
        setTotal(r.tripTotalCents);
        setOutcome({ ok: true, text: `${rands(r.amountCents)} received for ${qty} ${qty === 1 ? "passenger" : "passengers"}` });
        if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(80);
        router.refresh();
      } else {
        setOutcome({ ok: false, text: r.error });
      }
    } catch {
      setOutcome({ ok: false, text: "Payment failed. Try again." });
    } finally {
      setBusy(null);
    }
  }

  async function finish() {
    setBusy("end");
    try {
      await endTrip();
      router.push("/takings");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="px-4 pb-6 pt-4">
      <section aria-label="Current trip" className="rounded-2xl bg-muted p-4">
        <p className="text-lg font-bold">{trip.vehicle.registration}</p>
        <p className="text-xs text-muted-foreground">
          {trip.route.name} {"•"} {trip.vehicle.model}
        </p>
        <p className="mt-3 text-xs font-bold text-muted-foreground">This trip</p>
        <p className="text-2xl font-bold">{rands(total)}</p>
      </section>

      <section className="mt-5" aria-labelledby="where">
        <h2 id="where" className="mb-2 text-sm font-bold">Where to?</h2>
        <RadioGroup value={bandId} onValueChange={(v) => setBandId(String(v))} aria-labelledby="where">
          {trip.route.bands.map((b) => (
            <Label
              key={b.id}
              htmlFor={`band-${b.id}`}
              className="flex min-h-12 cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-base has-[[data-checked]]:border-foreground has-[[data-checked]]:bg-muted"
            >
              <span>{trip.route.model === "flat" ? b.label : `To ${b.label}`}</span>
              <span className="flex items-center gap-3 font-bold">
                {rands(b.amountCents)}
                <RadioGroupItem id={`band-${b.id}`} value={b.id} />
              </span>
            </Label>
          ))}
        </RadioGroup>
      </section>

      <section className="mt-5 flex items-center justify-between" aria-label="Passengers">
        <span className="text-sm font-bold">Paying passengers</span>
        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" size="icon-lg" aria-label="Fewer passengers" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>
            <Minus />
          </Button>
          <span className="w-6 text-center text-lg font-bold" aria-live="polite">{qty}</span>
          <Button type="button" variant="outline" size="icon-lg" aria-label="More passengers" disabled={qty >= trip.vehicle.seats} onClick={() => setQty((q) => q + 1)}>
            <Plus />
          </Button>
        </div>
      </section>

      {outcome ? (
        <div
          role={outcome.ok ? "status" : "alert"}
          className={cn("mt-5 flex items-center gap-3 rounded-xl p-4 text-white", outcome.ok ? "bg-green-500" : "bg-red-500")}
        >
          {outcome.ok ? <Check className="size-6 shrink-0" aria-hidden="true" /> : <X className="size-6 shrink-0" aria-hidden="true" />}
          <p className="text-sm font-semibold">{outcome.text}</p>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button onClick={() => charge("qr")} disabled={busy !== null || !band} className="h-14 rounded-full text-base font-semibold">
          {busy === "qr" ? <Loader2 className="animate-spin" /> : <QrCode />}
          Scan {rands(fare)}
        </Button>
        <Button onClick={() => charge("nfc")} disabled={busy !== null || !band} variant="outline" className="h-14 rounded-full text-base font-semibold">
          {busy === "nfc" ? <Loader2 className="animate-spin" /> : <Smartphone />}
          Tap {rands(fare)}
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">Demo reader: each press takes the fare from demo funds as a passenger.</p>

      <Alert className="mt-6">
        <AlertDescription>Fares go to the owner business wallet. Your takings today are under Takings.</AlertDescription>
      </Alert>
      <Button variant="ghost" onClick={finish} disabled={busy !== null} className="mt-4 h-11 w-full rounded-full font-semibold">
        {busy === "end" ? <Loader2 className="animate-spin" /> : null}
        End trip
      </Button>
    </div>
  );
}
