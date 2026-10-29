"use client";

import { useMemo, useState } from "react";
import { TxRow } from "@/components/personal/tx-row";
import { dayLabel } from "@/lib/format";
import type { TxCategory, TxView } from "@/lib/personal-types";
import { cn } from "@/lib/utils";

const FILTERS: { id: "all" | TxCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "taxi", label: "Taxi" },
  { id: "stall", label: "Stalls" },
  { id: "recharge", label: "Recharge" },
];

export function HistoryList({ transactions }: { transactions: TxView[] }) {
  const [filter, setFilter] = useState<"all" | TxCategory>("all");

  const groups = useMemo(() => {
    const shown = transactions.filter((t) => filter === "all" || t.category === filter);
    const map = new Map<string, TxView[]>();
    for (const t of shown) {
      const label = dayLabel(t.createdAt);
      map.set(label, [...(map.get(label) ?? []), t]);
    }
    return [...map.entries()];
  }, [transactions, filter]);

  return (
    <div className="px-4 pt-4">
      <div role="group" aria-label="Filter" className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold",
              filter === f.id ? "border-fuchsia-600 bg-fuchsia-600 text-white" : "border-foreground bg-background",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {groups.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        groups.map(([label, items]) => (
          <section key={label} className="mt-6" aria-label={label}>
            <h2 className="mb-2 text-sm font-bold">{label}</h2>
            <ul className="space-y-2">
              {items.map((tx) => (
                <li key={tx.id}>
                  <TxRow tx={tx} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
