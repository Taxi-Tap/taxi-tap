import { notFound } from "next/navigation";
import { AppHeader } from "@/components/personal/app-header";
import { RequestStatus } from "@/components/work/request-status";
import { getPaymentRequest } from "@/server/merchant";

export default async function RequestStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const request = await getPaymentRequest(id);
  if (!request) notFound();
  return (
    <main>
      <AppHeader title="Request payment" backHref="/request" />
      <RequestStatus request={request} />
    </main>
  );
}
