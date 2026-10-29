import { redirect } from "next/navigation";
import { AppHeader } from "@/components/personal/app-header";
import { ConfirmPayment } from "@/components/personal/confirm-payment";
import { getWalletSummary } from "@/server/wallets";

type Params = { method?: string; payee?: string; amount?: string; label?: string; name?: string; band?: string; req?: string };

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const amountCents = Number(p.amount);
  if (!p.payee || !Number.isSafeInteger(amountCents) || amountCents <= 0) redirect("/pay");
  const wallet = await getWalletSummary();
  return (
    <main>
      <AppHeader title="Pay" backHref="/pay" />
      <ConfirmPayment
        method={p.method === "nfc" ? "nfc" : "qr"}
        payeeWalletId={p.payee}
        requestId={p.req}
        payeeName={p.name ?? "Taxi Tap"}
        label={p.label ?? ""}
        bandId={p.band}
        amountCents={amountCents}
        last4={wallet.cardLast4}
        balanceCents={wallet.balanceCents}
      />
    </main>
  );
}
