import Link from "next/link";
import { HandCoins, Store, UserRound } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { Button } from "@/components/ui/button";
import { rands } from "@/lib/format";
import { getAccount } from "@/server/account";
import { getShopHome } from "@/server/merchant";

// Merchant home: today's sales and a shortcut to ask a customer for payment.
export default async function ShopHomePage() {
  const [account, shop] = await Promise.all([getAccount(), getShopHome()]);
  return (
    <main>
      <AppHeader
        title="Home"
        hideBack
        left={
          <Link href="/store" aria-label="Menu" className="inline-flex size-10 items-center justify-center rounded-full hover:bg-muted">
            <UserRound className="size-6" />
          </Link>
        }
      />
      <div className="px-4 pt-6">
        <h2 className="text-2xl font-bold tracking-tight">Hi {account.name.split(" ")[0]}</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Store className="size-4" aria-hidden="true" /> {shop.company}
        </p>

        <section aria-label="Today" className="mt-5 rounded-2xl bg-muted p-5 text-center">
          <p className="text-sm">Sales today</p>
          <p className="mt-1 text-4xl font-bold tracking-tight">{rands(shop.todayCents)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {shop.salesToday} {shop.salesToday === 1 ? "payment" : "payments"}
          </p>
        </section>

        <Button className="mt-5 h-12 w-full rounded-full text-base font-semibold" render={<Link href="/request" />} nativeButton={false}>
          <HandCoins /> Request payment
        </Button>

        <section aria-labelledby="recent" className="mt-8">
          <div className="mb-2 flex items-center justify-between">
            <h3 id="recent" className="text-sm font-bold">Latest sales</h3>
            <Link href="/sales" className="text-sm">View more</Link>
          </div>
          {shop.recent.length === 0 ? (
            <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">No sales yet today. Request a payment to get started.</p>
          ) : (
            <ul className="divide-y rounded-2xl bg-muted px-3">
              {shop.recent.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <span>
                    <span className="block text-sm font-bold">{s.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {s.time} {"·"} {s.by}
                    </span>
                  </span>
                  <span className="text-sm font-bold text-emerald-600">+ {rands(s.amountCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
