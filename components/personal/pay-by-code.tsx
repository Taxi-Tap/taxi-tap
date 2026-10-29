"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { Loader2 } from "lucide-react";
import { lookupPaymentCode } from "@/server/pay";
import { Field } from "@/components/auth/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

export function PayByCode() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await lookupPaymentCode(code);
      if (!r.ok) return setError(r.error);
      const qs = new URLSearchParams({
        method: "qr",
        payee: "request",
        req: r.requestId,
        amount: String(r.amountCents),
        name: r.company,
        label: r.company,
      });
      router.push(`/pay/confirm?${qs}`);
    } catch {
      setError("We could not check that code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex min-h-[calc(100dvh-3.5rem)] flex-col px-4 pb-8 pt-10">
      <p className="text-center">Enter the merchant code</p>
      <div className="mt-8 flex justify-center">
        <Field id="pay-code" label="Merchant code" error={error}>
          <InputOTP
            id="pay-code"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            value={code}
            onChange={(v) => setCode(v.toUpperCase())}
            onComplete={() => void submit()}
            aria-invalid={Boolean(error)}
            containerClassName="gap-2"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="size-12" />
              <InputOTPSlot index={1} className="size-12" />
              <InputOTPSlot index={2} className="size-12" />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} className="size-12" />
              <InputOTPSlot index={4} className="size-12" />
              <InputOTPSlot index={5} className="size-12" />
            </InputOTPGroup>
          </InputOTP>
        </Field>
      </div>
      {error ? (
        <Alert variant="destructive" role="alert" className="mt-4 sr-only">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      <div className="mt-auto pt-8">
        <Button type="submit" disabled={busy || code.length < 6} className="h-12 w-full rounded-full text-base font-semibold">
          {busy ? <Loader2 className="animate-spin" /> : null}
          Continue
        </Button>
      </div>
    </form>
  );
}
