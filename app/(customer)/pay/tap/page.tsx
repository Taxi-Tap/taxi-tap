import { AppHeader } from "@/components/personal/app-header";
import { ReaderScreen } from "@/components/personal/reader-screen";

export default async function TapPage({ searchParams }: { searchParams: Promise<{ band?: string; shop?: string }> }) {
  const { band, shop } = await searchParams;
  return (
    <main>
      <AppHeader title="Pay" backHref="/pay" />
      <ReaderScreen method="nfc" bandId={band} shopId={shop} />
    </main>
  );
}
