import { notFound } from "next/navigation";
import { AppHeader } from "@/components/personal/app-header";
import { RouteForm } from "@/components/owner/route-form";
import { getOwnerRoute } from "@/server/company";

export default async function AdminEditRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const route = await getOwnerRoute(id);
  if (!route) notFound();
  return (
    <main>
      <AppHeader title={route.sample ? "Route" : "Edit route"} backHref="/admin" />
      <RouteForm route={route} doneHref="/admin" />
    </main>
  );
}
