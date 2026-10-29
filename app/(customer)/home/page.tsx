import Link from "next/link";
import { Search, Star, UserRound } from "lucide-react";
import { GoogleMap } from "@/components/maps/google-map";
import { ModeToggle } from "@/components/personal/mode-toggle";

// Home (Map): the Google map when a key is set, a drawn street grid otherwise.
export default async function HomePage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const { mode } = await searchParams;
  const current = mode === "shop" ? "shop" : "taxi";
  return (
    <main className="relative h-[calc(100dvh-5rem)] overflow-hidden">
      <div className="absolute inset-0">
        <GoogleMap />
      </div>
      <div className="relative flex items-center justify-between bg-background/90 px-3 py-2 backdrop-blur">
        <Link href="/account" aria-label="Account" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted">
          <UserRound className="size-6" />
        </Link>
        <ModeToggle mode={current} base="/home" />
        <span className="size-10" />
      </div>
      <div className="relative px-3 pt-3">
        <Link
          href={`/home/search?mode=${current}`}
          className="flex h-12 items-center gap-3 rounded-lg bg-background px-4 shadow-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Search className="size-5" aria-hidden="true" />
          <span className="flex-1 text-base">{current === "taxi" ? "Where to?" : "Find a shop"}</span>
          <span className="h-6 w-px bg-foreground/60" aria-hidden="true" />
          <Star className="size-5" aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
