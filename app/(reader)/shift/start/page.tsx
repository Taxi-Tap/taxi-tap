import { redirect } from "next/navigation";
import { BusFront } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { GoogleMap } from "@/components/maps/google-map";
import { StartTripButton } from "@/components/work/start-trip-button";
import { rands } from "@/lib/format";
import { getShiftOptions } from "@/server/driver";

// Start trip: confirm vehicle, route and fares before boarding.
export default async function StartTripPage({ searchParams }: { searchParams: Promise<{ vehicle?: string; route?: string }> }) {
  const { vehicle: vehicleId, route: routeId } = await searchParams;
  const options = await getShiftOptions();
  const vehicle = options.vehicles.find((v) => v.id === vehicleId);
  const route = options.routes.find((r) => r.id === routeId);
  if (!vehicle || !route) redirect("/shift");

  return (
    <main>
      <div className="relative h-40 overflow-hidden">
        <GoogleMap />
        <div className="absolute inset-x-0 top-0 bg-background/80 backdrop-blur">
          <AppHeader title="Start trip" backHref="/shift" />
        </div>
      </div>
      <section className="-mt-6 rounded-t-3xl bg-background px-4 pb-8 pt-6 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-foreground/70" aria-hidden="true" />
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-yellow-300">
          <BusFront className="size-7" aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-center text-4xl font-bold tracking-tight">{vehicle.registration}</h2>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {vehicle.model} {"•"} {vehicle.seats} Seats
        </p>
        <dl className="mt-6 space-y-2.5 rounded-xl bg-muted p-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Route</dt>
            <dd className="font-bold">{route.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Fare model</dt>
            <dd className="font-bold">
              {route.model === "ladder" ? "Ladder" : "Flat"} | {route.bands.length} {route.bands.length === 1 ? "band" : "bands"}
            </dd>
          </div>
          {route.bands.map((b) => (
            <div key={b.id} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{route.model === "flat" ? b.label : `To ${b.label}`}</dt>
              <dd className="font-bold">{rands(b.amountCents)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 px-4 text-center text-xs text-muted-foreground">
          GPS is on | Every payment will be stamped with your location for the owner&apos;s map.
        </p>
        <StartTripButton vehicleId={vehicle.id} routeId={route.id} />
      </section>
    </main>
  );
}
