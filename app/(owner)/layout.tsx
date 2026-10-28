import type { ReactNode } from "react";
import { RoleLayout } from "@/components/auth/role-layout";

export default function OwnerLayout({
  children,
}: { children: ReactNode }) {
  return <RoleLayout role="owner">{children}</RoleLayout>;
}
