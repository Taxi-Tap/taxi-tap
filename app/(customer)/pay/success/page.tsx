import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { Button } from "@/components/ui/button";
import { rands } from "@/lib/format";
import { getReceipt } from "@/server/wallets";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ tx?: string }> }) {
  const { tx } = await searchParams;
  const receipt = tx ? await getReceipt(tx) : null;
  if (!receipt) redirect("/pay");
  return (
    <main>
      <AppHeader title="Pay" hideBack />
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col items-center px-4 pb-8 pt-16 text-center">
        <p>Payment of</p>
        <p className="mt-2 text-4xl font-bold">{rands(receipt.amountCents)}</p>
        <div className="mt-20 flex size-28 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="size-14" aria-hidden="true" />
        </div>
        <p role="status" className="mt-24 max-w-[10rem]">Payment received successfully!</p>
        <div className="mt-auto flex w-full gap-3 pt-10">
          <Button variant="secondary" className="h-11 flex-1 rounded-full bg-neutral-500 font-semibold text-white hover:bg-neutral-600" render={<Link href={`/history/${receipt.id}`} />} nativeButton={false}>
            View receipt
          </Button>
          <Button variant="secondary" className="h-11 flex-1 rounded-full bg-neutral-500 font-semibold text-white hover:bg-neutral-600" render={<Link href="/pay" />} nativeButton={false}>
            Make another payment
          </Button>
        </div>
      </div>
    </main>
  );
}
