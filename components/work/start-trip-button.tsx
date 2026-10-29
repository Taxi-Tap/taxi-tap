"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { startTrip } from "@/server/driver";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function StartTripButton({ vehicleId, routeId }: { vehicleId: string; routeId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function begin() {
    setBusy(true);
    setError("");
    try {
      const r = await startTrip({ vehicleId, routeId });
      if (!r.ok) return setError(r.error);
      router.push("/scan");
      router.refresh();
    } catch {
      setError("We could not start the trip. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      {error ? (
        <Alert variant="destructive" role="alert" className="mb-3">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button onClick={begin} disabled={busy} className="h-12 w-full rounded-full text-base font-semibold">
        {busy ? <Loader2 className="animate-spin" /> : null}
        Confirm &amp; begin boarding
      </Button>
    </div>
  );
}
