import { Suspense } from "react";
import { VerifyAccount } from "@/components/auth/verify-account";
import { LoadingScreen } from "@/components/auth/loading-screen";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<LoadingScreen label="Loading…" />}>
      <Verify searchParams={searchParams} />
    </Suspense>
  );
}

async function Verify({ searchParams }: { searchParams: Promise<{ email?: string | string[] }> }) {
  const { email } = await searchParams;
  return <VerifyAccount email={(Array.isArray(email) ? email[0] : email) ?? ""} />;
}
