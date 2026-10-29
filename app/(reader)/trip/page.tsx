import Link from "next/link";
import { BusFront, Route as RouteIcon, UserRound } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { Button } from "@/components/ui/button";
import { rands } from "@/lib/format";
import { getAccount } from "@/server/account";
import { getActiveTrip, getTakings } from "@/server/driver";

// Driver home: the trip in progress, or a prompt to start your shift.
export default async function DriverHomePage() {
  const [account, trip, takings] = await Promise.all([getAccount(), getActiveTrip(), getTakings()]);
  const first = account.name.split(" ")[0];
  return (
    <main>
      <AppHeader
        title="Home"
        hideBack
        left={
          <Link href="/driver" aria-label="Menu" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted">
            <UserRound className="size-6" />
          </Link>
        }
      />
      <div className="px-4 pt-6">
        <h2 className="text-2xl font-bold tracking-tight">Hi {first}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{trip ? "You are on a trip." : "Start your shift when you are ready to take passengers."}</p>

        {trip ? (
          <section aria-label="Current trip" className="mt-5 rounded-2xl bg-muted p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-400">
                <BusFront className="size-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold">{trip.vehicle.registration}</p>
                <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <RouteIcon className="size-3" aria-hidden="true" /> {trip.route.name}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <dt className="text-xs font-bold text-muted-foreground">This trip</dt>
                <dd className="text-xl font-bold">{rands(trip.totalCents)}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-muted-foreground">Passengers</dt>
                <dd className="text-xl font-bold">{trip.passengers}</dd>
              </div>
            </dl>
            <Button className="mt-4 h-12 w-full rounded-full text-base font-semibold" render={<Link href="/scan" />} nativeButton={false}>
              Open reader
            </Button>
          </section>
        ) : (
          <Button className="mt-5 h-12 w-full rounded-full text-base font-semibold" render={<Link href="/shift" />} nativeButton={false}>
            Start your shift
          </Button>
        )}

        <section aria-label="Today" className="mt-6 rounded-2xl border p-4">
          <p className="text-xs font-bold text-muted-foreground">Collected today</p>
          <p className="text-3xl font-bold">{rands(takings.todayCents)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {takings.trips} {takings.trips === 1 ? "trip" : "trips"} {"·"} {takings.passengers} passengers {"·"}{" "}
            <Link href="/takings" className="font-semibold underline">
              See takings
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
