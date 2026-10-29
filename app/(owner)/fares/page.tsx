import { AppHeader } from "@/components/personal/app-header";
import { RoutesList } from "@/components/owner/routes-list";
import { listOwnerRoutes } from "@/server/company";

export default async function FaresPage() {
  const routes = await listOwnerRoutes();
  return (
    <main>
      <AppHeader title="Fares & routes" hideBack />
      <RoutesList routes={routes} base="/fares" />
    </main>
  );
}
