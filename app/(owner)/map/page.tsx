import Link from "next/link";
import { CircleHelp, UserRound } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { OwnerMap } from "@/components/owner/owner-map";
import { getMapData } from "@/server/company";

// Map: where vehicles and stalls took payments. Pins are real GPS-stamped payments (TAX-53);
// until there are any, labelled sample pins are shown.
export default async function OwnerMapPage() {
  const map = await getMapData();
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
      <OwnerMap pins={map.pins} paymentsToday={map.paymentsToday} densest={map.densest} sample={map.sample} />
    </main>
  );
}
