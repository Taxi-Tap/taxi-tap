import Link from "next/link";
import { BusFront } from "lucide-react";

export function Brand() {
  return (
    <Link href="/" aria-label="Taxi Tap home" className="inline-flex items-center gap-3">
      <span className="flex size-9 items-center justify-center rounded-full bg-fuchsia-600 text-white">
        <BusFront className="size-5" aria-hidden="true" />
      </span>
      <span className="text-sm font-bold tracking-tight">Taxi Tap</span>
    </Link>
  );
}
