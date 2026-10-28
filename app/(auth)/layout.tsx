import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthProfile } from "@/app/auth-actions";
import { homeForRole } from "@/lib/role-routing";

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await getAuthProfile();
  if (profile) redirect(homeForRole(profile.role));
  return children;
}
