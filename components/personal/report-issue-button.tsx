"use client";

import { toast } from "sonner";

export function ReportIssueButton({ reference }: { reference: string }) {
  return (
    <button
      type="button"
      onClick={() => toast.success(`Thanks. We noted an issue with ${reference}. Support will follow up.`)}
      className="mt-4 block w-full text-center text-sm font-semibold text-muted-foreground underline-offset-4 hover:underline"
    >
      Report an issue with this payment
    </button>
  );
}
