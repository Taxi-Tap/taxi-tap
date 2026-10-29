import Link from "next/link";
import { Banknote, BusFront, CircleHelp, Ellipsis, Plus, Repeat, Send, Store, UserRound } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { AccountRow } from "@/components/personal/virtual-card";
import { SampleBadge } from "@/components/owner/sample-badge";
import { rands } from "@/lib/format";
import { getOwnerWallet } from "@/server/company";

const ACTIONS = [
  { label: "Send", icon: Send },
  { label: "Transfer", icon: Repeat },
  { label: "Deposit", icon: Banknote },
  { label: "More", icon: Ellipsis },
] as const;

// Dashboard: the company wallet. Figures are sample data until the company has received payments.
export default async function DashboardPage() {
  const w = await getOwnerWallet();
  return (
    <main>
      <AppHeader
        title="Dashboard"
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

      <section className="px-4 pt-8 text-center" aria-labelledby="balance-label">
        <p id="balance-label" className="text-base">
          Balance {w.sample ? <SampleBadge className="ml-1 align-middle" /> : null}
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight">{rands(w.balanceCents)}</p>
      </section>

      <dl className="mt-6 grid grid-cols-2 gap-3 px-4">
        <div className="rounded-xl bg-muted p-4">
          <dt className="text-xs font-bold">Current balance</dt>
          <dd className="mt-1 text-sm">{rands(w.currentCents)}</dd>
        </div>
        <div className="rounded-xl bg-muted p-4">
          <dt className="text-xs font-bold">Pending transaction</dt>
          <dd className="mt-1 text-sm">+ {rands(w.pendingCents)}</dd>
        </div>
      </dl>

      <ul className="mt-6 grid grid-cols-4 gap-3 px-4">
        {ACTIONS.map(({ label, icon: Icon }) => (
          <li key={label}>
            <button
              type="button"
              disabled
              title="Coming soon"
              className="flex w-full flex-col items-center gap-2 rounded-xl border py-3 text-sm opacity-80 disabled:cursor-not-allowed"
            >
              <Icon className="size-6" aria-hidden="true" />
              {label}
            </button>
          </li>
        ))}
      </ul>

      <section className="mt-8 px-4" aria-labelledby="accounts-heading">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="accounts-heading" className="text-sm font-bold">Accounts</h2>
          <Plus className="size-5" aria-hidden="true" />
        </div>
        <div className="rounded-2xl bg-muted p-2">
          <AccountRow last4={w.cardLast4} balanceCents={w.balanceCents} />
        </div>
      </section>

      <section className="mt-8 px-4" aria-labelledby="tx-heading">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="tx-heading" className="text-sm font-bold">Transactions</h2>
          <Link href="/team" className="text-sm">View more</Link>
        </div>
        <ul className="divide-y rounded-2xl bg-muted px-3">
          {w.transactions.map((t) => {
            const Icon = t.kind === "vehicle" ? BusFront : Store;
            return (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${t.kind === "vehicle" ? "bg-orange-400" : "bg-purple-300"}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{t.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.subtitle}</span>
                </span>
                <span className="text-sm font-bold">{rands(t.amountCents)}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </main>
  );
}
