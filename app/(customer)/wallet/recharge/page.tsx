import { AppHeader } from "@/components/personal/app-header";
import { RechargeForm } from "@/components/personal/recharge-form";
import { getWalletSummary } from "@/server/wallets";

export default async function RechargePage() {
  const wallet = await getWalletSummary();
  return (
    <main>
      <AppHeader title="Recharge" backHref="/wallet" />
      <RechargeForm last4={wallet.cardLast4} balanceCents={wallet.balanceCents} />
    </main>
  );
}
