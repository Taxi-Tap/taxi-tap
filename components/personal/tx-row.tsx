import Link from "next/link";
import { ArrowDownLeft, BusFront, Send, Store, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";
import { rands, timeLabel } from "@/lib/format";
import type { TxView } from "@/lib/personal-types";

const ICONS = {
  taxi: { icon: BusFront, bg: "bg-yellow-300" },
  stall: { icon: Store, bg: "bg-purple-300" },
  recharge: { icon: WalletCards, bg: "bg-purple-300" },
  transfer: { icon: Send, bg: "bg-sky-300" },
} as const;

export function TxRow({ tx }: { tx: TxView }) {
  const { icon: Icon, bg } = ICONS[tx.category];
  const failed = tx.status !== "success";
  const credit = tx.direction === "in" && !failed;
  return (
    <Link href={`/history/${tx.id}`} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", bg)}>
        {tx.direction === "in" && tx.category === "transfer" ? <ArrowDownLeft className="size-5" aria-hidden="true" /> : <Icon className="size-5" aria-hidden="true" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          {tx.title}
          {tx.subtitle ? <span className="text-muted-foreground"> | {tx.subtitle}</span> : null}
        </span>
        <span className="block text-xs text-muted-foreground">
          {timeLabel(tx.createdAt)}
          {failed ? ` · ${tx.status === "failed" ? "Failed" : "Pending"}` : ""}
        </span>
      </span>
      <span className={cn("text-sm font-bold whitespace-nowrap", credit && "text-emerald-600", failed && "text-muted-foreground line-through")}>
        {credit ? "+ " : "- "}
        {rands(tx.amountCents)}
      </span>
    </Link>
  );
}
