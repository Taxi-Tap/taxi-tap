"use client";

import { useMemo, useState } from "react";
import { GoogleMap } from "@/components/maps/google-map";
import { SampleBadge } from "@/components/owner/sample-badge";
import type { MapPin } from "@/lib/owner-mock";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "vehicle", label: "Vehicles" },
  { id: "stall", label: "Stalls" },
] as const;

export function OwnerMap({ pins, paymentsToday, densest, sample }: { pins: MapPin[]; paymentsToday: number; densest: string; sample: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const shown = useMemo(() => pins.filter((p) => filter === "all" || p.kind === filter), [pins, filter]);

  return (
    <>
      <div className="absolute inset-0">
        <GoogleMap pins={shown} />
      </div>
      <div role="group" aria-label="Filter pins" className="relative z-10 flex gap-2 px-3 pt-3">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold shadow-sm",
              filter === f.id ? "border-fuchsia-600 bg-fuchsia-600 text-white" : "border-foreground bg-background",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <section aria-label="Today" className="absolute inset-x-3 bottom-4 z-10 overflow-hidden rounded-xl bg-background p-4 shadow-lg">
        <div className="absolute inset-x-0 top-0 h-1 bg-neutral-200">
          <div className="h-full w-2/3 bg-green-500" />
        </div>
        <p className="mt-1 flex items-center gap-2 text-base font-bold">
          {paymentsToday} {paymentsToday === 1 ? "payment" : "payments"} today {sample ? <SampleBadge /> : null}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{densest}</p>
      </section>
    </>
  );
}
