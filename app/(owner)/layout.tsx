import type { ReactNode } from "react";
import { RoleLayout } from "@/components/auth/role-layout";
import { OwnerNav } from "@/components/owner/owner-nav";

// Owner account: a phone-width column with the owner tab bar underneath.
export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="owner">
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background pb-20">{children}</div>
      <OwnerNav />
    </RoleLayout>
  );
}
