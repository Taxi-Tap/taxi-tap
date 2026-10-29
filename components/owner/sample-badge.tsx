import { cn } from "@/lib/utils";

/** Marks placeholder data so nobody mistakes it for real figures. */
export function SampleBadge({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900", className)}>
      Sample
    </span>
  );
}
