"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createRoute, updateRoute } from "@/server/company";
import { Field, inputClass } from "@/components/auth/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { randsToCents } from "@/lib/money";
import type { RouteView } from "@/lib/owner-mock";
import { cn } from "@/lib/utils";

type Row = { label: string; amount: string };

/** Add or edit a route and its fares. Sample routes are shown read-only. */
export function RouteForm({ route, doneHref = "/fares" }: { route?: RouteView; doneHref?: string }) {
  const router = useRouter();
  const readOnly = route?.sample ?? false;
  const [name, setName] = useState(route?.name ?? "");
  const [model, setModel] = useState<"flat" | "ladder">(route?.model ?? "ladder");
  const [rows, setRows] = useState<Row[]>(
    route ? route.bands.map((b) => ({ label: b.label, amount: (b.amountCents / 100).toFixed(2) })) : [{ label: "", amount: "" }],
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function setRow(i: number, patch: Partial<Row>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    let bands: { label: string; amountCents: number }[];
    try {
      bands = rows.map((r) => ({ label: r.label, amountCents: randsToCents(r.amount) }));
    } catch {
      return setError("Enter every fare as an amount, for example 12.50.");
    }
    setBusy(true);
    try {
      const input = { name, model, bands: model === "flat" ? bands.slice(0, 1) : bands };
      const r = route ? await updateRoute(route.id, input) : await createRoute(input);
      if (!r.ok) return setError(r.error);
      toast.success(route ? "Route updated" : "Route added");
      router.push(doneHref);
      router.refresh();
    } catch {
      setError("We could not save the route. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 px-4 pt-4">
      {readOnly ? (
        <Alert role="status">
          <AlertDescription>This is a sample route. Add your own route to set real fares.</AlertDescription>
        </Alert>
      ) : null}
      <Field id="route-name" label="Route name">
        <Input id="route-name" value={name} disabled={readOnly} onChange={(e) => setName(e.target.value)} placeholder="Rank → Berea" className={inputClass} />
      </Field>
      <div role="group" aria-label="Fare type" className="flex gap-2">
        {(["ladder", "flat"] as const).map((m) => (
          <button
            key={m}
            type="button"
            disabled={readOnly}
            onClick={() => setModel(m)}
            aria-pressed={model === m}
            className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold", model === m ? "border-foreground bg-black text-white" : "bg-background")}
          >
            {m === "ladder" ? "Ladder (fare per stop)" : "Flat (one fare)"}
          </button>
        ))}
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-1 text-base font-medium">Fares</legend>
        {(model === "flat" ? rows.slice(0, 1) : rows).map((row, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field id={`label-${i}`} label={model === "flat" ? "Applies to" : "Stop"}>
              <Input id={`label-${i}`} value={row.label} disabled={readOnly} onChange={(e) => setRow(i, { label: e.target.value })} placeholder={model === "flat" ? "Any stop" : "Berea"} className={inputClass} />
            </Field>
            <Field id={`amount-${i}`} label="Fare (R)">
              <Input id={`amount-${i}`} inputMode="decimal" value={row.amount} disabled={readOnly} onChange={(e) => setRow(i, { amount: e.target.value.replace(/[^0-9.]/g, "") })} className={cn(inputClass, "w-28")} />
            </Field>
            {model === "ladder" && rows.length > 1 && !readOnly ? (
              <Button type="button" variant="outline" size="icon-lg" className="mb-0 size-12 shrink-0" aria-label={`Remove fare ${i + 1}`} onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}>
                <Trash2 />
              </Button>
            ) : null}
          </div>
        ))}
        {model === "ladder" && !readOnly ? (
          <Button type="button" variant="outline" onClick={() => setRows((r) => [...r, { label: "", amount: "" }])}>
            <Plus /> Add stop
          </Button>
        ) : null}
      </fieldset>

      {error ? (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {readOnly ? null : (
        <Button type="submit" disabled={busy} className="mb-4 h-12 w-full rounded-full text-base font-semibold">
          {busy ? <Loader2 className="animate-spin" /> : null}
          {route ? "Save route" : "Add route"}
        </Button>
      )}
    </form>
  );
}
