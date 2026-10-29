import Link from "next/link";
import { AppHeader } from "@/components/personal/app-header";
import { VirtualCard } from "@/components/personal/virtual-card";
import { Button } from "@/components/ui/button";
import { rands } from "@/lib/format";
import { getWalletSummary } from "@/server/wallets";

// Cards / accounts. Every account is created with one Virtual Card.
export default async function CardsPage() {
  const wallet = await getWalletSummary();
  return (
    <main>
      <AppHeader title="Virtual Card" backHref="/wallet" />
      <div className="px-4 pt-6">
        <VirtualCard number={wallet.cardNumber} holder={wallet.holder} />
        <p className="mt-6 text-center text-sm text-muted-foreground">Balance</p>
        <p className="text-center text-3xl font-bold">{rands(wallet.balanceCents)}</p>
        <p className="mt-2 text-center text-xs text-muted-foreground">Demo card: funds are simulated and the number is not a real card.</p>
        <Button className="mt-8 h-12 w-full rounded-full text-base font-semibold" render={<Link href="/wallet/recharge" />} nativeButton={false}>
          Recharge
        </Button>
      </div>
    </main>
  );
}
