import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getAuthProfile } from "@/app/auth-actions";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { homeForRole, type AppRole } from "@/lib/role-routing";

export async function RoleLayout({
  children,
  role,
}: {
  children: ReactNode;
  role: AppRole;
}) {
  const profile = await getAuthProfile();
  if (!profile) redirect("/sign-in");
  if (profile.role !== role) redirect(homeForRole(profile.role));
  return children;
}

export async function RolePlaceholder({
  role,
  heading,
}: {
  role: AppRole;
  heading: string;
}) {
  const profile = await getAuthProfile();
  if (!profile) redirect("/sign-in");
  if (profile.role !== role) redirect(homeForRole(profile.role));
  const roleName = role.replaceAll("_", " ");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5 py-10">
      <div className="rounded-3xl border border-neutral-200 p-6 shadow-sm sm:p-8">
        <p className="text-sm font-semibold capitalize text-[#6D28D9]">
          {roleName}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-neutral-950">
          {heading}
        </h1>
        <p className="mt-3 text-neutral-600">Welcome, {profile.name}.</p>
        <SignOutButton />
      </div>
    </main>
  );
}
