import type { ReactNode } from "react";
import { RoleLayout } from "@/components/auth/role-layout";
import { BottomNav } from "@/components/personal/bottom-nav";

// Personal account: a phone-width column with the tab bar underneath.
export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="customer">
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background pb-20">{children}</div>
      <BottomNav />
    </RoleLayout>
  );
}
