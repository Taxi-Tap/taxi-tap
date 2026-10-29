import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

/** Label + control + error message, wired together for screen readers. */
export function Field({
  id,
  label,
  error,
  hint,
  action,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  /** Extra control on the label row, e.g. "Forgot password?". */
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id} className="text-base">
          {label}
        </Label>
        {action}
      </div>
      {children}
      {hint && !error ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Shared sizing so inputs match the 48px tall controls in the designs. */
export const inputClass = "h-12 rounded-lg px-3 text-base md:text-base";
export const primaryButtonClass = "h-12 w-full rounded-full text-base font-semibold";
