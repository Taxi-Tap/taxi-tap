import { AppHeader } from "@/components/personal/app-header";
import { HelpContent } from "@/components/personal/help-content";

export default function StoreHelpPage() {
  return (
    <main>
      <AppHeader title="Help" backHref="/store" />
      <HelpContent />
    </main>
  );
}
