import { notFound } from "next/navigation";
import { UserRound } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { SampleBadge } from "@/components/owner/sample-badge";
import { getTeamMember } from "@/server/company";

export default async function ContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = await getTeamMember(id);
  if (!m?.person) notFound();
  const p = m.person;
  const fields: [string, string][] = [
    ["Name", p.firstName],
    ["Surname", p.surname],
    ["Date of birth", p.dob],
    ["Gender", p.gender],
  ];
  return (
    <main>
      <AppHeader title="Contact" backHref={`/team/${m.id}`} />
      <div className="flex flex-col items-center px-4 pt-6">
        <span className="flex size-24 items-center justify-center rounded-full bg-yellow-300">
          <UserRound className="size-8" aria-hidden="true" />
        </span>
        <h2 className="mt-3 flex items-center gap-2 text-base font-bold">
          {m.name} {m.sample ? <SampleBadge /> : null}
        </h2>
        <a href={`tel:${p.phone.replace(/[^+\d]/g, "")}`} className="text-xs text-muted-foreground">
          {p.phone}
        </a>
      </div>
      <section aria-label="Personal info" className="mx-4 mt-6 rounded-2xl bg-muted p-4">
        <h3 className="text-sm font-bold">Personal Info</h3>
        <dl className="mt-3 space-y-3">
          {fields.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-bold text-muted-foreground">{k}</dt>
              <dd className="text-base">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
