import { AppHeader } from "@/components/personal/app-header";
import { HelpContent } from "@/components/personal/help-content";

export default function HelpPage() {
  return (
    <main>
      <AppHeader title="Help" backHref="/account" />
      <HelpContent />
    </main>
  );
}
