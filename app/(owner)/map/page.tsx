import Link from "next/link";
import { CircleHelp, UserRound } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { OwnerMap } from "@/components/owner/owner-map";
import { SAMPLE_PINS } from "@/lib/owner-mock";
import { getMapSummary } from "@/server/company";

// Map: where vehicles and stalls took payments. Pins are sample coordinates until
// payments carry GPS (TAX-53) and the owner has vehicles and stalls registered.
export default async function OwnerMapPage() {
  const summary = await getMapSummary();
  return (
    <main className="relative h-[calc(100dvh-5rem)] overflow-hidden">
      <div className="relative z-10 bg-background">
        <AppHeader
          title="Map"
          hideBack
          left={
            <Link href="/menu" aria-label="Menu" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted">
              <UserRound className="size-6" />
            </Link>
          }
          right={
            <Link href="/menu/help" aria-label="Help" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted">
              <CircleHelp className="size-6" />
            </Link>
          }
        />
      </div>
      <OwnerMap pins={SAMPLE_PINS} paymentsToday={summary.paymentsToday} densest={summary.densest} />
    </main>
  );
}
