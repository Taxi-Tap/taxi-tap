import { AppHeader } from "@/components/personal/app-header";
import { RouteForm } from "@/components/owner/route-form";

export default function NewRoutePage() {
  return (
    <main>
      <AppHeader title="Add route" backHref="/fares" />
      <RouteForm />
    </main>
  );
}
