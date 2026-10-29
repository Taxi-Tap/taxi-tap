"use client";

import { useState } from "react";
import { Check, Copy, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { regenerateJoinCode } from "@/server/company";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function group(code: string) {
  return code.replace(/(.{3})(?=.)/g, "$1-");
}

/** The company code people type to join the company, with copy and "make a new code". */
export function CompanyCode({ initialCode }: { initialCode: string }) {
  const [code, setCode] = useState(initialCode);
  const [copied, setCopied] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(group(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy. Select the code and copy it.");
    }
  }

  async function regenerate() {
    setBusy(true);
    try {
      const r = await regenerateJoinCode();
      if (!r.ok) return toast.error(r.error);
      setCode(r.joinCode);
      setConfirm(false);
      toast.success("New company code created");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="code-heading" className="mx-4 mt-4 rounded-2xl border p-4">
      <h3 id="code-heading" className="text-sm font-bold">Company code</h3>
      <p className="mt-1 text-xs text-muted-foreground">Drivers and staff enter this code when they create an account to join your company.</p>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-muted p-3">
        <p className="font-mono text-2xl font-bold tracking-widest" aria-label={`Company code ${code.split("").join(" ")}`}>
          {group(code)}
        </p>
        <Button type="button" variant="outline" size="icon-lg" aria-label="Copy company code" onClick={copy}>
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
      <Button type="button" variant="ghost" className="mt-3" onClick={() => setConfirm(true)}>
        <RefreshCw /> Make a new code
      </Button>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make a new code?</DialogTitle>
            <DialogDescription>The old code stops working straight away. People who already joined stay on your team.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={regenerate} disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              Make new code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
