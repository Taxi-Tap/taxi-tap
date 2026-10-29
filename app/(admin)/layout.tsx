import type { ReactNode } from "react";
import { RoleLayout } from "@/components/auth/role-layout";

export default function AdminLayout({
  children,
}: { children: ReactNode }) {
  return <RoleLayout role="association_admin">{children}</RoleLayout>;
}
