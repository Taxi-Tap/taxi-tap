import type { ReactNode } from "react";
import { RoleLayout } from "@/components/auth/role-layout";

export default function CustomerLayout({
  children,
}: { children: ReactNode }) {
  return <RoleLayout role="customer">{children}</RoleLayout>;
}
