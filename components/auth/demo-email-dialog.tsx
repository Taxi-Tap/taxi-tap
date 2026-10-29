"use client";

import { MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DemoEmail } from "@/lib/auth-schemas";

const URL_PATTERN = /(https?:\/\/\S+)/;

/**
 * Stand-in for an email while no provider is configured: shows what would have
 * been sent (a code or a link) in a popup.
 */
export function DemoEmailDialog({
  email,
  onClose,
}: {
  email: DemoEmail | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={email !== null} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MailOpen className="size-5" aria-hidden="true" />
            {email?.subject}
          </DialogTitle>
          <DialogDescription>
            Demo mode: no email service is connected, so the message is shown here instead of being sent.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 rounded-lg bg-muted p-4 text-sm break-words">
          {email?.text.split("\n").map((line, i) =>
            line.split(URL_PATTERN).map((part, j) =>
              URL_PATTERN.test(part) ? (
                <a key={`${i}-${j}`} href={part} className="font-semibold underline underline-offset-4">
                  Open link
                </a>
              ) : (
                <span key={`${i}-${j}`}>{part}</span>
              ),
            ),
          )}
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
