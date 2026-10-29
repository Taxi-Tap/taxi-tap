import Link from "next/link";
import { CircleHelp, Ellipsis, Plus, Repeat, ScanLine, Send, UserRound } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { AccountRow } from "@/components/personal/virtual-card";
import { TxRow } from "@/components/personal/tx-row";
import { rands } from "@/lib/format";
import { getWalletSummary, listMyTransactions } from "@/server/wallets";

const ACTIONS = [
  { href: "/wallet/send", label: "Send", icon: Send },
  { href: "/wallet/transfer", label: "Transfer", icon: Repeat },
  { href: "/wallet/recharge", label: "Recharge", icon: ScanLine },
  { href: "/history", label: "More", icon: Ellipsis },
] as const;

// Wallet: balance, quick actions, accounts and the latest transactions (TAX-37).
export default async function WalletPage() {
  const [wallet, recent] = await Promise.all([getWalletSummary(), listMyTransactions(5)]);
  return (
    <main>
      <AppHeader
        title="Wallet"
        hideBack
        left={
          <Link href="/account" aria-label="Account" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted">
            <UserRound className="size-6" />
          </Link>
        }
        right={
          <Link href="/account/help" aria-label="Help" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted">
            <CircleHelp className="size-6" />
          </Link>
        }
      />

      <section className="px-4 pt-8 text-center" aria-labelledby="balance-label">
        <p id="balance-label" className="text-base">Balance</p>
        <p className="mt-2 text-4xl font-bold tracking-tight">{rands(wallet.balanceCents)}</p>
      </section>

      <ul className="mt-6 grid grid-cols-4 gap-3 px-4">
        {ACTIONS.map(({ href, label, icon: Icon }) => (
          <li key={label}>
            <Link href={href} className="flex flex-col items-center gap-2 rounded-xl border py-3 text-sm outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50">
              <Icon className="size-6" aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-8 px-4" aria-labelledby="accounts-heading">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="accounts-heading" className="text-sm font-bold">Accounts</h2>
          <Link href="/wallet/recharge" aria-label="Add funds" className="inline-flex size-8 items-center justify-center rounded-full hover:bg-muted">
            <Plus className="size-5" />
          </Link>
        </div>
        <div className="rounded-2xl bg-muted p-2">
          <AccountRow last4={wallet.cardLast4} balanceCents={wallet.balanceCents} />
        </div>
      </section>

      <section className="mt-8 px-4" aria-labelledby="tx-heading">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="tx-heading" className="text-sm font-bold">Transactions</h2>
          <Link href="/history" className="text-sm">View more</Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">No transactions yet. Recharge your wallet to get started.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((tx) => (
              <li key={tx.id}>
                <TxRow tx={tx} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
