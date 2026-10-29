"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpDown, MapPin, MoreHorizontal, Star } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import type { Destination } from "@/lib/personal-types";

export function DestinationSearch({ mode, destinations }: { mode: "taxi" | "shop"; destinations: Destination[] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const needle = to.trim().toLowerCase();
  const shown = needle
    ? destinations.filter((d) => `${d.title} ${d.subtitle}`.toLowerCase().includes(needle))
    : destinations;

  return (
    <div>
      <div className="bg-neutral-200 px-4 pb-6 pt-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center" aria-hidden="true">
            <span className="size-3 rounded-full bg-black" />
            <span className="h-9 w-0.5 bg-black" />
            <span className="size-3 rotate-45 bg-black" />
          </div>
          <div className="flex-1 space-y-2">
            {mode === "taxi" ? (
              <Input aria-label="Your location" placeholder="Enter your location" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 rounded-full bg-background px-4 text-base" />
            ) : null}
            <Input aria-label="Where to" placeholder={mode === "taxi" ? "Where to?" : "Find a shop"} value={to} onChange={(e) => setTo(e.target.value)} className="h-10 rounded-full bg-background px-4 text-base" />
          </div>
          <button type="button" aria-label="Swap" onClick={() => { setFrom(to); setTo(from); }} className="inline-flex size-10 items-center justify-center rounded-full hover:bg-white/60">
            <ArrowUpDown className="size-5" />
          </button>
        </div>
      </div>
      <div className="-mt-4 px-4">
        <div className="flex h-12 items-center gap-3 rounded-full bg-background px-5 shadow-md">
          <Link href={`/home?mode=${mode}`} className="flex-1 text-base">
            Choose on Map
          </Link>
          <span className="h-6 w-px bg-foreground/60" aria-hidden="true" />
          <button type="button" aria-label="Saved places" onClick={() => toast("Saved places are coming soon.")}>
            <Star className="size-5" />
          </button>
        </div>
      </div>
      <ul className="mt-3 space-y-2 px-4">
        {shown.length === 0 ? (
          <li className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
            {destinations.length === 0 ? "Nothing to show yet. Ask your association to add routes." : "No matches. Try another name."}
          </li>
        ) : (
          shown.map((d) => (
            <li key={d.id}>
              <Link
                href={mode === "taxi" ? `/pay?band=${d.id}` : `/pay?shop=${d.id}`}
                className="flex items-center gap-3 rounded-full border px-4 py-3 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <MapPin className="size-5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{d.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{d.subtitle}</span>
                </span>
                <MoreHorizontal className="size-5 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
