import type { ReactNode } from "react";
import { RoleLayout } from "@/components/auth/role-layout";
import { AdminNav } from "@/components/work/admin-nav";

// Association admin: a phone-width column with the admin tab bar underneath.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="association_admin">
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background pb-20">{children}</div>
      <AdminNav />
    </RoleLayout>
  );
}
