import type { ReactNode } from "react";
import { RoleLayout } from "@/components/auth/role-layout";
import { MerchantNav } from "@/components/work/merchant-nav";

// Merchant account: a phone-width column with the merchant tab bar underneath.
export default function MerchantLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout role="merchant_staff">
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background pb-20">{children}</div>
      <MerchantNav />
    </RoleLayout>
  );
}
