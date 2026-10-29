import Link from "next/link";
import { BusFront, Store } from "lucide-react";
import { cn } from "@/lib/utils";

/** Taxi / Shop pill at the top of the home screens. */
export function ModeToggle({ mode, base }: { mode: "taxi" | "shop"; base: string }) {
  const item = (m: "taxi" | "shop", label: string, Icon: typeof BusFront) => (
    <Link
      href={`${base}?mode=${m}`}
      aria-current={mode === m ? "page" : undefined}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
        mode === m ? "bg-black text-white" : "text-foreground",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </Link>
  );
  return (
    <div role="group" aria-label="Mode" className="flex rounded-full bg-neutral-200 p-0.5">
      {item("taxi", "Taxi", BusFront)}
      {item("shop", "Shop", Store)}
    </div>
  );
}
