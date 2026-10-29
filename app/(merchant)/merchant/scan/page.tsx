import { AppHeader } from "@/components/personal/app-header";
import { MerchantScan } from "@/components/work/merchant-scan";

// Scan: enter the amount, then scan the customer's code (or type it) to take the payment (TAX-55).
export default function MerchantScanPage() {
  return (
    <main>
      <AppHeader title="Scan" hideBack />
      <MerchantScan />
    </main>
  );
}
