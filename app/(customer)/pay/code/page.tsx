import { AppHeader } from "@/components/personal/app-header";
import { PayByCode } from "@/components/personal/pay-by-code";

// Pay a merchant by typing the 6-character code from their Request payment screen.
export default function PayCodePage() {
  return (
    <main>
      <AppHeader title="Pay" backHref="/pay" />
      <PayByCode />
    </main>
  );
}
