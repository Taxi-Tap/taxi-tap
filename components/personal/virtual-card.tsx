import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { rands } from "@/lib/format";

/** The small gradient card used in account lists. */
export function CardThumb({ variant = "sunset" }: { variant?: "sunset" | "ocean" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative flex h-10 w-14 shrink-0 flex-col justify-between rounded-md p-1 text-[6px] font-bold text-white/90",
        variant === "sunset" ? "bg-gradient-to-br from-orange-400 via-rose-500 to-pink-600" : "bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-500",
      )}
    >
      <span>Taxi Tap</span>
      <span className="self-end italic">VISA</span>
    </span>
  );
}

/** One row: card, name, masked number and balance. */
export function AccountRow({
  name = "Virtual Card",
  last4,
  balanceCents,
  variant,
  selected,
  trailing = "arrow",
  onClick,
}: {
  name?: string;
  last4: string;
  balanceCents: number;
  variant?: "sunset" | "ocean";
  selected?: boolean;
  trailing?: "arrow" | "none";
  onClick?: () => void;
}) {
  const body: ReactNode = (
    <>
      <CardThumb variant={variant} />
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-sm">{name}</span>
        <span className="block text-xs tracking-wider text-muted-foreground">•••• •••• •••• {last4}</span>
      </span>
      <span className="text-sm font-bold">{rands(balanceCents)}</span>
      {trailing === "arrow" ? <ArrowRight className="size-5 text-muted-foreground" aria-hidden="true" /> : null}
    </>
  );
  const cls = cn("flex w-full items-center gap-3 rounded-lg p-2", selected && "border border-foreground bg-background");
  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={selected} className={cls}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}
