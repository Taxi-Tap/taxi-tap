import { AppHeader } from "@/components/personal/app-header";
import { RouteForm } from "@/components/owner/route-form";

export default function AdminNewRoutePage() {
  return (
    <main>
      <AppHeader title="Add route" backHref="/admin" />
      <RouteForm doneHref="/admin" />
    </main>
  );
}
