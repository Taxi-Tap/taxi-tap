import { AppHeader } from "@/components/personal/app-header";
import { HelpContent } from "@/components/personal/help-content";

export default function AdminHelpPage() {
  return (
    <main>
      <AppHeader title="Help" backHref="/admin/menu" />
      <HelpContent />
    </main>
  );
}
