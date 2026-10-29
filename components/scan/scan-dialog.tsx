"use client";

import { useState, type FormEvent } from "react";
import { QrScanner } from "@/components/scan/qr-scanner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Camera scan with a typed-code fallback. Calls `onCredential` with a scanned token or the 8-character code. */
export function ScanDialog({
  open,
  onOpenChange,
  onCredential,
  title = "Scan the customer's code",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCredential: (credential: string) => void;
  title?: string;
}) {
  const [code, setCode] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    onCredential(code.trim());
    setCode("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Hold the camera over their QR code, or type the code under it.</DialogDescription>
        </DialogHeader>
        {open ? (
          <QrScanner
            onScan={(text) => {
              onCredential(text);
              onOpenChange(false);
            }}
          />
        ) : null}
        <form onSubmit={submit} className="flex items-end gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="manual-code">Or enter the code</Label>
            <Input id="manual-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABCD-EFGH" autoComplete="off" className="h-11 font-mono text-base tracking-widest" />
          </div>
          <Button type="submit" disabled={!code.trim()} className="h-11">
            Use code
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
