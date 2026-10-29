import { Suspense } from "react";
import { TwoFactorForm } from "@/components/auth/two-factor-form";
import { LoadingScreen } from "@/components/auth/loading-screen";

export default function TwoFactorPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<LoadingScreen label="Loading…" />}>
      <TwoFactor searchParams={searchParams} />
    </Suspense>
  );
}

async function TwoFactor({ searchParams }: { searchParams: Promise<{ to?: string | string[] }> }) {
  const { to } = await searchParams;
  return <TwoFactorForm maskedEmail={(Array.isArray(to) ? to[0] : to) ?? ""} />;
}
