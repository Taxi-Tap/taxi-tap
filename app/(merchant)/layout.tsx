import type { ReactNode } from "react";
import { RoleLayout } from "@/components/auth/role-layout";

export default function MerchantLayout({
  children,
}: { children: ReactNode }) {
  return <RoleLayout role="merchant_staff">{children}</RoleLayout>;
}
