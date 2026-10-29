import { AppHeader } from "@/components/personal/app-header";
import { HelpContent } from "@/components/personal/help-content";

export default function DriverHelpPage() {
  return (
    <main>
      <AppHeader title="Help" backHref="/driver" />
      <HelpContent />
    </main>
  );
}
