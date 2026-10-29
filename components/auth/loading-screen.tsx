import { Loader2 } from "lucide-react";

/** Full-screen spinner shown while a sign-in / sign-up redirect is in flight. */
export function LoadingScreen({ label = "Signing you in…" }: { label?: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background" role="status" aria-live="polite">
      <Loader2 className="size-10 animate-spin text-foreground" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </main>
  );
}
