import { Building2 } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { LinkBusiness } from "@/components/work/link-business";
import { listMembers, listOrganisations } from "@/server/organisations";

// Businesses linked to the association (TAX-34), plus the association team.
export default async function BusinessesPage() {
  const [businesses, members] = await Promise.all([listOrganisations(), listMembers()]);
  return (
    <main>
      <AppHeader title="Businesses" hideBack />
      <div className="px-4 pt-4">
        <LinkBusiness />
        <h2 className="mt-8 text-sm font-bold">Linked businesses</h2>
        {businesses.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">No businesses linked yet. Ask an owner for their company code.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {businesses.map((b) => (
              <li key={b.id} className="flex items-center gap-3 rounded-xl bg-muted px-3 py-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange-400">
                  <Building2 className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-bold">{b.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{b.location ?? "No location"}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
        <h2 className="mt-8 text-sm font-bold">Association team</h2>
        <ul className="mt-3 divide-y">
          {members.map((m) => (
            <li key={m.profileId} className="flex items-center justify-between py-3 text-sm">
              <span className="font-medium">
                {m.name}
                {m.isMe ? " (you)" : ""}
              </span>
              <span className="text-xs capitalize text-muted-foreground">{m.role.replaceAll("_", " ")}</span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
