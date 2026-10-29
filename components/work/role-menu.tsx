import Link from "next/link";
import { ChevronRight, UserRound } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getAccount, getCompanyName } from "@/server/account";

function maskPhone(phone: string | null) {
  if (!phone) return "Not added";
  return `••• ••• ${phone.replace(/\D/g, "").slice(-4)}`;
}

/** Profile screen shared by driver and merchant accounts. `base` is the URL prefix of their settings and help pages. */
export async function RoleMenu({ roleLabel, base, avatarClass }: { roleLabel: string; base: string; avatarClass: string }) {
  const [a, company] = await Promise.all([getAccount(), getCompanyName()]);
  const since = new Date(a.createdAt).toLocaleDateString("en-ZA", { month: "short", year: "numeric", timeZone: "Africa/Johannesburg" });
  const rows = [
    { label: "Email", value: a.email, href: undefined },
    { label: "Phone", value: maskPhone(a.phone), href: undefined },
    { label: "Company", value: company ?? "Not joined yet", href: undefined },
    { label: "Settings", value: "", href: `${base}/settings` },
    { label: "Help", value: "", href: `${base}/help` },
  ];
  return (
    <main>
      <AppHeader title="Profile" hideBack />
      <div className="flex flex-col items-center px-4 pt-6">
        <span className={`flex size-24 items-center justify-center rounded-full ${avatarClass}`}>
          <UserRound className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-base font-bold">{a.name}</h2>
        <p className="text-xs text-muted-foreground">
          {roleLabel}
          {company ? ` · ${company}` : ""} · Account created on {since}
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
