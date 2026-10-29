import { redirect } from "next/navigation";
import { AppHeader } from "@/components/personal/app-header";
import { FareReader } from "@/components/work/fare-reader";
import { getActiveTrip } from "@/server/driver";

// Reader: charge fares on the current trip. Needs a trip, so start one from Shift first.
export default async function ReaderPage() {
  const trip = await getActiveTrip();
  if (!trip) redirect("/shift");
  return (
    <main>
      <AppHeader title="Reader" hideBack />
      <FareReader trip={trip} />
    </main>
  );
}
