import { AppHeader } from "@/components/personal/app-header";
import { SendForm } from "@/components/personal/send-form";
import { getWalletSummary } from "@/server/wallets";

export default async function SendPage() {
  const wallet = await getWalletSummary();
  return (
    <main>
      <AppHeader title="Send" backHref="/wallet" />
      <SendForm last4={wallet.cardLast4} balanceCents={wallet.balanceCents} label="Send" />
    </main>
  );
}
