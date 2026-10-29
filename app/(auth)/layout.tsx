import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthProfile } from "@/app/auth-actions";
import { LoadingScreen } from "@/components/auth/loading-screen";
import { homeForRole } from "@/lib/role-routing";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen label="Loading…" />}>
      <SignedOutOnly>{children}</SignedOutOnly>
    </Suspense>
  );
}

/** Signed-in users have no business on the sign-in / sign-up screens. */
async function SignedOutOnly({ children }: { children: ReactNode }) {
  const profile = await getAuthProfile();
  if (profile) redirect(homeForRole(profile.role));
  return children;
}
