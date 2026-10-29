"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BusFront, Route as RouteIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { rands } from "@/lib/format";
import type { RouteOption, VehicleOption } from "@/lib/work-types";

function Choice({ id, value, icon, title, subtitle }: { id: string; value: string; icon: "bus" | "route"; title: string; subtitle: string }) {
  const Icon = icon === "bus" ? BusFront : RouteIcon;
  return (
    <Label
      htmlFor={id}
      className="flex min-h-16 cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 has-[[data-checked]]:border-foreground has-[[data-checked]]:bg-muted"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-400">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-bold">{title}</span>
        <span className="block truncate text-xs font-normal text-muted-foreground">{subtitle}</span>
      </span>
      <RadioGroupItem id={id} value={value} />
    </Label>
  );
}

export function ShiftPicker({
  company,
  vehicles,
  routes,
  activeTrip,
}: {
  company: string | null;
  vehicles: VehicleOption[];
  routes: RouteOption[];
  activeTrip: { vehicle: string; route: string } | null;
}) {
  const router = useRouter();
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [routeId, setRouteId] = useState(routes[0]?.id ?? "");
  const [error, setError] = useState("");

  if (!company) {
    return (
      <div className="px-6 pt-6">
        <Alert role="status">
          <AlertDescription>You are not part of a company yet. Ask your owner for the company code and join from sign-up.</AlertDescription>
        </Alert>
      </div>
    );
  }

  function start() {
    if (!vehicleId) return setError("Choose a vehicle.");
    if (!routeId) return setError("Choose a route.");
    router.push(`/shift/start?vehicle=${vehicleId}&route=${routeId}`);
  }

  return (
    <div className="px-6 pb-8 pt-4">
      <h2 className="text-3xl font-bold tracking-tight">Start your shift</h2>
      <p className="mt-2 text-base text-muted-foreground">Pick your vehicle and route. Fares go to the owner business wallet, not you.</p>

      {activeTrip ? (
        <Alert role="status" className="mt-4">
          <AlertDescription>
            You already have a trip running ({activeTrip.vehicle}, {activeTrip.route}).{" "}
            <Link href="/scan" className="font-semibold underline">
              Go to the reader
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="mt-6" aria-labelledby="vehicle-heading">
        <h3 id="vehicle-heading" className="mb-2 text-xs font-bold">Vehicle</h3>
        {vehicles.length === 0 ? (
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">No vehicles yet. Ask {company} to add one.</p>
        ) : (
          <RadioGroup value={vehicleId} onValueChange={(v) => setVehicleId(String(v))} aria-labelledby="vehicle-heading">
            {vehicles.map((v) => (
              <Choice key={v.id} id={`veh-${v.id}`} value={v.id} icon="bus" title={v.registration} subtitle={`${v.model} • ${v.seats} seats`} />
            ))}
          </RadioGroup>
        )}
      </section>

      <section className="mt-6" aria-labelledby="route-heading">
        <h3 id="route-heading" className="mb-2 text-xs font-bold">Route</h3>
        {routes.length === 0 ? (
          <p className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">No routes yet. Ask {company} to add one under Fares.</p>
        ) : (
          <RadioGroup value={routeId} onValueChange={(v) => setRouteId(String(v))} aria-labelledby="route-heading">
            {routes.map((r) => (
              <Choice
                key={r.id}
                id={`route-${r.id}`}
                value={r.id}
                icon="route"
                title={r.name}
                subtitle={`${r.model === "ladder" ? "Ladder" : "Flat"} • from ${rands(Math.min(...r.bands.map((b) => b.amountCents)))}`}
              />
            ))}
          </RadioGroup>
        )}
      </section>

      {error ? (
        <Alert variant="destructive" role="alert" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <Button onClick={start} disabled={vehicles.length === 0 || routes.length === 0} className="mt-8 h-12 w-full rounded-full text-base font-semibold">
        Start shift
      </Button>
    </div>
  );
}
