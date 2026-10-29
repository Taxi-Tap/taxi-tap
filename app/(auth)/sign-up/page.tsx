import { Suspense } from "react";
import { SignUpFlow } from "@/components/auth/sign-up-flow";
import { LoadingScreen } from "@/components/auth/loading-screen";

// The landing page links here as /sign-up?type=personal or /sign-up?type=business.
export default function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<LoadingScreen label="Loading…" />}>
      <SignUp searchParams={searchParams} />
    </Suspense>
  );
}

async function SignUp({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const { type } = await searchParams;
  const value = Array.isArray(type) ? type[0] : type;
  return <SignUpFlow initialMode={value === "business" ? "business" : "personal"} />;
}
