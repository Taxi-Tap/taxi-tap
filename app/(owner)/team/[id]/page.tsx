import Link from "next/link";
import { notFound } from "next/navigation";
import { BusFront, Phone, Store, UserRound } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { SampleBadge } from "@/components/owner/sample-badge";
import { Button } from "@/components/ui/button";
import { rands } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getTeamMember } from "@/server/company";

const LOOK = {
  driver: { icon: UserRound, bg: "bg-yellow-300" },
  vehicle: { icon: BusFront, bg: "bg-orange-400" },
  stall: { icon: Store, bg: "bg-purple-300" },
  staff: { icon: UserRound, bg: "bg-purple-300" },
} as const;

// Team profile: who they are, today's takings and recent trips.
export default async function TeamProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await getTeamMember(id);
  if (!m) notFound();
  const { icon: Icon, bg } = LOOK[m.kind];
  const d = m.driver;
  const hasContact = Boolean(m.person);

  return (
    <main>
      <AppHeader title={m.name} backHref="/team" />
      <div className="space-y-3 px-4 pt-4">
        <div className="flex items-center gap-4 rounded-2xl bg-muted p-4">
          <span className={cn("flex size-20 shrink-0 items-center justify-center rounded-full", bg)}>
            <Icon className="size-7" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-lg font-bold">
              {m.name} {m.sample ? <SampleBadge /> : null}
            </p>
            {d ? (
              <p className="text-xs text-muted-foreground">
                {d.vehicle}
                {d.seats ? ` • ${d.seats} seats` : ""}
                <br />
                {d.registration}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">{m.detail}</p>
            )}
          </div>
        </div>

        {d ? (
          <>
            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-muted p-4">
                <dt className="text-xs font-bold text-muted-foreground">Today</dt>
                <dd className="mt-1 text-lg font-bold">{rands(d.todayCents)}</dd>
              </div>
              <div className="rounded-2xl bg-muted p-4">
                <dt className="text-xs font-bold text-muted-foreground">Trips</dt>
                <dd className="mt-1 text-lg font-bold">{d.trips}</dd>
              </div>
            </dl>
            <section aria-labelledby="recent" className="pt-3">
              <h2 id="recent" className="text-sm font-bold">Recent trips</h2>
              {d.recent.length === 0 ? (
                <p className="mt-3 rounded-xl bg-muted p-4 text-sm text-muted-foreground">No trips yet.</p>
              ) : (
                <ul className="divide-y">
                  {d.recent.map((t, i) => (
                    <li key={i} className="flex items-center justify-between py-3">
                      <span>
                        <span className="block text-base font-bold">{t.route}</span>
                        <span className="block text-xs text-muted-foreground">
                          {t.time} {"·"} {t.passengers} passengers
                        </span>
                      </span>
                      <span className="text-base font-bold">{rands(t.amountCents)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}

        {hasContact ? (
          <Button variant="outline" className="h-12 w-full rounded-full text-base font-semibold" render={<Link href={`/team/${m.id}/contact`} />} nativeButton={false}>
            <Phone /> Contact details
          </Button>
        ) : null}
      </div>
    </main>
  );
}
