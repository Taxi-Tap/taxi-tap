"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Top bar used on every personal screen: back arrow, centred title, optional right slot. */
export function AppHeader({
  title,
  backHref,
  hideBack,
  right,
  left,
  dark,
}: {
  title: string;
  backHref?: string;
  hideBack?: boolean;
  right?: ReactNode;
  /** Replaces the back arrow, e.g. the account icon on Wallet. */
  left?: ReactNode;
  dark?: boolean;
}) {
  const router = useRouter();
  const back = cn(
    "inline-flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
    dark ? "hover:bg-white/10" : "hover:bg-muted",
  );
  return (
    <header className={cn("relative flex h-14 items-center justify-center border-b", dark && "border-white/20 bg-black text-white")}>
      {left ? <div className="absolute left-2">{left}</div> : hideBack ? null : (
        <div className="absolute left-2">
          {backHref ? (
            <Link href={backHref} aria-label="Back" className={back}>
              <ArrowLeft className="size-5" />
            </Link>
          ) : (
            <button type="button" aria-label="Back" onClick={() => router.back()} className={back}>
              <ArrowLeft className="size-5" />
            </button>
          )}
        </div>
      )}
      <h1 className="text-base font-semibold">{title}</h1>
      {right ? <div className="absolute right-2">{right}</div> : null}
    </header>
  );
}
