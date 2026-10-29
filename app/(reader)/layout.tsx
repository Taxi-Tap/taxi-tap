import type { ReactNode } from "react";
import { RoleLayout } from "@/components/auth/role-layout";
import { DriverNav } from "@/components/work/driver-nav";

// Driver account: a phone-width column with the driver tab bar underneath.
export default function DriverLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="driver">
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background pb-20">{children}</div>
      <DriverNav />
    </RoleLayout>
  );
}
