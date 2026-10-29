import { AppHeader } from "@/components/personal/app-header";
import { TeamList } from "@/components/owner/team-list";
import { getCompany, getTeam } from "@/server/company";

export default async function TeamPage() {
  const [team, { company }] = await Promise.all([getTeam(), getCompany()]);
  return (
    <main>
      <AppHeader title="Manage team" hideBack />
      <TeamList team={team} joinCode={company?.joinCode ?? null} />
    </main>
  );
}
