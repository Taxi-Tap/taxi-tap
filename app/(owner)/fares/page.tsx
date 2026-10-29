import Link from "next/link";
import { Plus } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { SampleBadge } from "@/components/owner/sample-badge";
import { Button } from "@/components/ui/button";
import { rands } from "@/lib/format";
import { listOwnerRoutes } from "@/server/company";

export default async function FaresPage() {
  const routes = await listOwnerRoutes();
  return (
    <main>
      <AppHeader title="Fares & routes" hideBack />
      <ul className="space-y-3 px-4 pt-4">
        {routes.map((r) => (
          <li key={r.id} className="rounded-2xl bg-muted p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-base font-bold">
                {r.name} {r.sample ? <SampleBadge /> : null}
              </h2>
              <span className="rounded-full bg-background px-3 py-0.5 text-xs font-bold">{r.model === "ladder" ? "Ladder" : "Flat"}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {r.bands.map((b) => (
                <li key={b.id} className="flex justify-between text-base text-muted-foreground">
                  <span>{r.model === "flat" ? b.label : `To ${b.label}`}</span>
                  <span className="text-foreground">{rands(b.amountCents)}</span>
                </li>
              ))}
            </ul>
            <Link href={`/fares/${r.id}`} className="mt-2 inline-block text-xs font-bold">
              {r.sample ? "View route" : "Edit route"} {"→"}
            </Link>
          </li>
        ))}
      </ul>
      <div className="sticky bottom-20 mt-6 bg-background px-4 pb-2 pt-2">
        <Button className="h-12 w-full rounded-full text-base font-semibold" render={<Link href="/fares/new" />} nativeButton={false}>
          <Plus /> Add route
        </Button>
      </div>
    </main>
  );
}
