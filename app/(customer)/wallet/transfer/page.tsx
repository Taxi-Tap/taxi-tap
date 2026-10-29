import { AppHeader } from "@/components/personal/app-header";
import { SendForm } from "@/components/personal/send-form";
import { getWalletSummary, listRecentRecipients } from "@/server/wallets";

// Transfer: the designs move money between two of your own cards. The schema has one wallet per
// person today, so Transfer sends to someone you have paid before; Send accepts any email or number.
export default async function TransferPage() {
  const [wallet, recent] = await Promise.all([getWalletSummary(), listRecentRecipients()]);
  return (
    <main>
      <AppHeader title="Transfer" backHref="/wallet" />
      <SendForm last4={wallet.cardLast4} balanceCents={wallet.balanceCents} recent={recent} label="Transfer" />
    </main>
  );
}
