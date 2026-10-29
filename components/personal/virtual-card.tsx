import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { rands } from "@/lib/format";
import { groupCardNumber } from "@/lib/card";

export type CardVariant = "sunset" | "ocean";

// Gradients from the Virtual Card artwork: warm (orange to pink) and cool (teal to blue).
const GRADIENT: Record<CardVariant, string> = {
  sunset: "bg-[linear-gradient(to_top_right,#f23f82_0%,#f5806f_50%,#f9bc5c_100%)]",
  ocean: "bg-[linear-gradient(to_top_right,#3b9aeb_0%,#45bfe5_50%,#54ecd8_100%)]",
};

/** The full Virtual Card: brand, card number, holder name and VISA mark. */
export function VirtualCard({
  number,
  holder,
  variant = "sunset",
  className,
}: {
  /** 16 digits, ungrouped. */
  number: string;
  holder: string;
  variant?: CardVariant;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Taxi Tap virtual card ending ${number.slice(-4)}, ${holder}`}
      className={cn("relative aspect-[1.7] w-full overflow-hidden rounded-[1.75rem] p-5 text-black", GRADIENT[variant], className)}
    >
      <div className="flex items-start justify-between">
        <span className="text-lg font-bold">Taxi Tap</span>
        <span className="text-sm">Virtual Card</span>
      </div>
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between">
        <div>
          <p className="text-sm tracking-wide">{groupCardNumber(number)}</p>
          <p className="mt-1 text-sm">{holder}</p>
        </div>
        <span className="text-2xl font-black italic tracking-tighter">VISA</span>
      </div>
    </div>
  );
}

/** Miniature of the card for lists. */
export function CardThumb({ variant = "sunset" }: { variant?: CardVariant }) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative flex h-10 w-14 shrink-0 flex-col justify-between rounded-md p-1 text-[6px] font-bold text-black/80", GRADIENT[variant])}
    >
      <span>Taxi Tap</span>
      <span className="self-end text-[7px] font-black italic">VISA</span>
    </span>
  );
}

/** One row: card, name, masked number and balance. Pass `href` to make it a link. */
export function AccountRow({
  name = "Virtual Card",
  last4,
  balanceCents,
  variant,
  selected,
  trailing = "arrow",
  href,
  onClick,
}: {
  name?: string;
  last4: string;
  balanceCents: number;
  variant?: CardVariant;
  selected?: boolean;
  trailing?: "arrow" | "none";
  href?: string;
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
  if (href) {
    return (
      <Link href={href} className={cn(cls, "outline-none focus-visible:ring-3 focus-visible:ring-ring/50")}>
        {body}
      </Link>
    );
  }
  return onClick ? (
    <button type="button" onClick={onClick} aria-pressed={selected} className={cls}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  );
}
