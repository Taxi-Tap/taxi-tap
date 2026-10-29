import { Building2 } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { CompanyCode } from "@/components/owner/company-code";
import { ORG_TYPE_LABELS } from "@/lib/auth-validation";
import { getCompany } from "@/server/company";

// Company profile: name, link, type, location and the company code new drivers and staff use to join.
export default async function CompanyPage() {
  const { company } = await getCompany();
  if (!company) {
    return (
      <main>
        <AppHeader title="Company" backHref="/menu" />
        <p className="m-4 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          Your account is not linked to a company yet. Create one when you sign up as a business.
        </p>
      </main>
    );
  }
  const since = new Date(company.createdAt).toLocaleDateString("en-ZA", { month: "short", year: "numeric", timeZone: "Africa/Johannesburg" });
  const rows: [string, string][] = [
    ["Company name", company.name],
    ["Slug", company.slug ?? "Not set"],
    ["Type", ORG_TYPE_LABELS[company.type]],
    ["Location", company.location ?? "Not set"],
    ["Team members", String(company.memberCount)],
    ["Created", since],
  ];
  return (
    <main>
      <AppHeader title="Company" backHref="/menu" />
      <div className="flex flex-col items-center px-4 pt-6">
        <span className="flex size-24 items-center justify-center overflow-hidden rounded-2xl bg-fuchsia-100">
          {company.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- small data URL saved at sign-up
            <img src={company.logoUrl} alt={`${company.name} logo`} className="size-full object-cover" />
          ) : (
            <Building2 className="size-9 text-fuchsia-700" aria-hidden="true" />
          )}
        </span>
        <h2 className="mt-3 text-lg font-bold">{company.name}</h2>
        <p className="text-xs text-muted-foreground">{ORG_TYPE_LABELS[company.type]}</p>
      </div>
      <section aria-label="Company details" className="mx-4 mt-6 rounded-2xl bg-muted p-4">
        <dl className="space-y-3">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-bold text-muted-foreground">{k}</dt>
              <dd className="text-base">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <CompanyCode initialCode={company.joinCode} />
    </main>
  );
}
