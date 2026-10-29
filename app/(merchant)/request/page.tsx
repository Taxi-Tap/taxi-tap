import { AppHeader } from "@/components/personal/app-header";
import { RequestForm } from "@/components/work/request-form";

// Request payment: type an amount, get a 6-character code for the customer to pay.
export default function RequestPage() {
  return (
    <main>
      <AppHeader title="Request payment" hideBack />
      <RequestForm />
    </main>
  );
}
