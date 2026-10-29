import { AppHeader } from "@/components/personal/app-header";
import { HelpContent } from "@/components/personal/help-content";

export default function OwnerHelpPage() {
  return (
    <main>
      <AppHeader title="Help" backHref="/menu" />
      <HelpContent />
    </main>
  );
}
