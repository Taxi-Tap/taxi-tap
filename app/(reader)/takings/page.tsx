import { Check, X } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { rands } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getTakings } from "@/server/driver";

// Shift summary: what you collected today. The money itself is in the owner company wallet.
export default async function TakingsPage() {
  const t = await getTakings();
  return (
    <main>
      <AppHeader title="Takings" hideBack />
      <div className="px-4 pt-4">
        <p className="text-center text-sm">Collected today</p>
        <p className="mt-1 text-center text-4xl font-bold tracking-tight">{rands(t.todayCents)}</p>
        <dl className="mt-6 grid grid-cols-3 gap-3">
          {[
            ["Trips", t.trips],
            ["Payments", t.payments],
            ["Passengers", t.passengers],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-muted p-3 text-center">
              <dt className="text-xs font-bold text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-xl font-bold">{v}</dd>
            </div>
          ))}
        </dl>
        <h2 className="mt-8 text-sm font-bold">Recent fares</h2>
        {t.recent.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">No fares yet today. Start a shift to begin.</p>
        ) : (
          <ul className="divide-y">
            {t.recent.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <span className={cn("flex size-8 items-center justify-center rounded-full text-white", r.ok ? "bg-green-500" : "bg-red-500")}>
                  {r.ok ? <Check className="size-4" aria-hidden="true" /> : <X className="size-4" aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold">{r.label}</span>
                  <span className="block text-xs text-muted-foreground">
                    {r.time} {"·"} {r.passengers} {r.passengers === 1 ? "passenger" : "passengers"}
                  </span>
                </span>
                <span className="text-base font-bold">{rands(r.amountCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
