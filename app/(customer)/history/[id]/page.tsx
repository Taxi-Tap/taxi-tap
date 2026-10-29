import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X } from "lucide-react";
import { AppHeader } from "@/components/personal/app-header";
import { MapBackdrop } from "@/components/personal/map-backdrop";
import { ReportIssueButton } from "@/components/personal/report-issue-button";
import { Button } from "@/components/ui/button";
import { rands } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getReceipt } from "@/server/wallets";

const METHOD = { qr: "QR scan", nfc: "NFC tap", simulated: "Wallet" } as const;
const STATUS = { success: "Completed", failed: "Failed", pending: "Pending" } as const;

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tx = await getReceipt(id);
  if (!tx) notFound();

  const ok = tx.status === "success";
  const when = new Date(tx.createdAt);
  const date = `${when.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Johannesburg" })} | ${when.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Johannesburg" })}`;
  const rows: [string, string][] = [
    ["Status", STATUS[tx.status]],
    ["Date", date],
    [tx.direction === "in" ? "Received from" : "Paid to", tx.counterparty],
    ["Method", METHOD[tx.method]],
    ["Reference", tx.reference],
    ...(tx.location ? ([["Location", tx.location]] as [string, string][]) : []),
    ...(tx.failureReason ? ([["Reason", tx.failureReason]] as [string, string][]) : []),
  ];

  return (
    <main>
      <div className="relative h-40 overflow-hidden">
        <MapBackdrop />
        <div className="absolute inset-x-0 top-0 bg-background/80 backdrop-blur">
          <AppHeader title="Receipt" backHref="/history" />
        </div>
      </div>
      <section className="-mt-6 rounded-t-3xl bg-background px-4 pb-8 pt-6 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-foreground/70" aria-hidden="true" />
        <div className={cn("mx-auto flex size-16 items-center justify-center rounded-full text-white", ok ? "bg-green-500" : "bg-red-500")}>
          {ok ? <Check className="size-9" aria-hidden="true" /> : <X className="size-9" aria-hidden="true" />}
        </div>
        <p className="mt-5 text-center text-4xl font-bold">{rands(tx.amountCents)}</p>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {tx.title}
          {tx.subtitle ? ` • ${tx.subtitle}` : ""}
        </p>
        <dl className="mt-6 space-y-3 rounded-xl bg-muted p-4 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className={cn("text-right font-bold", k === "Status" && (ok ? "text-green-600" : "text-red-600"))}>{v}</dd>
            </div>
          ))}
        </dl>
        <Button className="mt-6 h-12 w-full rounded-full text-base font-semibold" render={<Link href="/history" />} nativeButton={false}>
          Done
        </Button>
        <ReportIssueButton reference={tx.reference} />
      </section>
    </main>
  );
}
