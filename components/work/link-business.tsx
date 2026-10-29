"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { linkBusiness } from "@/server/organisations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Link a taxi business to the association with the business's company code. */
export function LinkBusiness() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await linkBusiness(code);
      if (!r.ok) return setError(r.error);
      toast.success(`${r.name} linked`);
      setCode("");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2" noValidate>
      <Label htmlFor="biz-code">Link a business</Label>
      <div className="flex gap-2">
        <Input id="biz-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC-DEF-GHJ" autoComplete="off" className="h-11 font-mono tracking-widest" />
        <Button type="submit" disabled={busy || !code.trim()} className="h-11">
          {busy ? <Loader2 className="animate-spin" /> : null}
          Link
        </Button>
      </div>
      {error ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
