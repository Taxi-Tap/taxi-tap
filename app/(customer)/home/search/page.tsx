import { UserRound } from "lucide-react";
import Link from "next/link";
import { DestinationSearch } from "@/components/personal/destination-search";
import { ModeToggle } from "@/components/personal/mode-toggle";
import { listDestinations } from "@/server/pay";

// Home (Trip search and selection): pick a fare band (TAX-54) or a shop, then pay.
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const current = mode === "shop" ? "shop" : "taxi";
  const destinations = await listDestinations(current);
  return (
    <main>
      <div className="flex items-center justify-between px-3 py-2">
        <Link href="/account" aria-label="Account" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted">
          <UserRound className="size-6" />
        </Link>
        <ModeToggle mode={current} base="/home/search" />
        <span className="size-10" />
      </div>
      <DestinationSearch mode={current} destinations={destinations} />
    </main>
  );
}
