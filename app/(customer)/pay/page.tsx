import Link from "next/link";
import { Keyboard, QrCode, ScanLine, Smartphone } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { cn } from "@/lib/utils";

// Pay: choose Tap (NFC) or QR scan. A destination picked on Home (?band= or ?shop=) is carried along.
export default async function PayPage({ searchParams }: { searchParams: Promise<{ band?: string; shop?: string }> }) {
  const { band, shop } = await searchParams;
  const qs = new URLSearchParams();
  if (band) qs.set("band", band);
  if (shop) qs.set("shop", shop);
  const suffix = qs.size ? `?${qs}` : "";
  const tile = "flex aspect-square w-48 flex-col items-center justify-center gap-3 rounded-[2rem] border text-sm font-bold outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
  return (
    <main>
      <AppHeader title="Pay" backHref="/home" />
      <div className="flex flex-col items-center gap-4 px-4 pt-14">
        <p className="mb-4 text-base">Enter payment method</p>
        <Link href={`/pay/tap${suffix}`} className={cn(tile, "border-black bg-black text-white")}>
          <Smartphone className="size-9" aria-hidden="true" />
          Tap
        </Link>
        <Link href={`/pay/scan${suffix}`} className={cn(tile, "border-foreground bg-background")}>
          <QrCode className="size-9" aria-hidden="true" />
          QR Scan
        </Link>
        <Link href="/pay/show" className="flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
          <ScanLine className="size-4" aria-hidden="true" /> Show my code to a driver or shop
        </Link>
        <Link href="/pay/code" className="flex items-center gap-2 text-sm font-semibold underline underline-offset-4">
          <Keyboard className="size-4" aria-hidden="true" /> Enter a merchant code
        </Link>
      </div>
    </main>
  );
}
