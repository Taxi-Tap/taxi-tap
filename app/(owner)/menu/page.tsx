import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCompany } from "@/server/company";

function maskPhone(phone: string | null) {
  if (!phone) return "Not added";
  return `••• ••• ${phone.replace(/\D/g, "").slice(-4)}`;
}

// Menu: the owner as a user, plus links to the company profile, settings and help.
export default async function OwnerMenuPage() {
  const { company, owner } = await getCompany();
  const since = new Date(owner.createdAt).toLocaleDateString("en-ZA", { month: "short", year: "numeric", timeZone: "Africa/Johannesburg" });
  const rows = [
    { label: "Email", value: owner.email, href: undefined },
    { label: "Phone", value: maskPhone(owner.phone), href: undefined },
    { label: "Company profile", value: company?.name ?? "", href: "/company" },
    { label: "Settings", value: "", href: "/menu/settings" },
    { label: "Help", value: "", href: "/menu/help" },
  ];
  return (
    <main>
      <AppHeader title="Profile" hideBack />
      <div className="flex flex-col items-center px-4 pt-6">
        <span className="flex size-24 items-center justify-center rounded-full bg-orange-300">
          <UserRound className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-base font-bold">{owner.name}</h2>
        <p className="text-xs text-muted-foreground">
          Owner{company ? ` · ${company.name}` : ""} · Account created on {since}
        </p>
      </div>
      <ul className="mt-6 divide-y px-4">
        {rows.map((r) => {
          const inner = (
            <>
              <span className="flex-1 text-base">{r.label}</span>
              {r.value ? <span className="max-w-[55%] truncate text-sm text-muted-foreground">{r.value}</span> : null}
              {r.href ? <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" /> : null}
            </>
          );
          return (
            <li key={r.label}>
              {r.href ? (
                <Link href={r.href} className="flex items-center gap-2 py-4 outline-none focus-visible:bg-muted">
                  {inner}
                </Link>
              ) : (
                <div className="flex items-center gap-2 py-4">{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="px-4 pt-10">
        <SignOutButton variant="outline" className="[&_button]:h-12 [&_button]:w-full [&_button]:rounded-full [&_button]:bg-muted [&_button]:text-base [&_button]:font-semibold" />
      </div>
    </main>
  );
}
