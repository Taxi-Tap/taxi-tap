import { AppHeader } from "@/components/personal/app-header";
import { RoutesList } from "@/components/owner/routes-list";
import { listOwnerRoutes } from "@/server/company";

// Association fare table (TAX-59): the routes and fares linked taxi businesses work from.
export default async function AdminFaresPage() {
  const routes = await listOwnerRoutes();
  return (
    <main>
      <AppHeader title="Fare table" hideBack />
      <p className="px-4 pt-4 text-sm text-muted-foreground">Drivers of linked businesses can start shifts on these routes.</p>
      <RoutesList routes={routes} base="/admin/routes" />
    </main>
  );
}
