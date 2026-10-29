import { AppHeader } from "@/components/personal/app-header";
import { ReaderScreen } from "@/components/personal/reader-screen";

export default async function ScanPage({ searchParams }: { searchParams: Promise<{ band?: string; shop?: string }> }) {
  const { band, shop } = await searchParams;
  return (
    <main className="bg-black">
      <AppHeader title="Pay" backHref="/pay" dark />
      <ReaderScreen method="qr" bandId={band} shopId={shop} />
    </main>
  );
}
