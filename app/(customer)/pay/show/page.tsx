import { AppHeader } from "@/components/personal/app-header";
import { ShowCode } from "@/components/personal/show-code";

// Show my code (TAX-42 / TAX-41): the QR a driver or merchant scans to charge you.
export default function ShowCodePage() {
  return (
    <main>
      <AppHeader title="My code" backHref="/pay" />
      <ShowCode />
    </main>
  );
}
