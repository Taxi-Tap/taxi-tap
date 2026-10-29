import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { LoadingScreen } from "@/components/auth/loading-screen";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<LoadingScreen label="Loading…" />}>
      <ResetPassword searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPassword({ searchParams }: { searchParams: Promise<{ token?: string | string[] }> }) {
  const { token } = await searchParams;
  return <ResetPasswordForm token={Array.isArray(token) ? (token[0] ?? "") : (token ?? "")} />;
}
