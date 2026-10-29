"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Brand } from "@/components/auth/brand";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Mobile-first frame shared by every auth screen: top bar with back arrow and
 * title, optional step bar, brand, heading and description (TAX-32 designs).
 */
export function AuthScreen({
  barTitle,
  title,
  description,
  step,
  totalSteps = 4,
  onBack,
  backHref,
  hideBack,
  children,
  footer,
}: {
  barTitle: string;
  title: string;
  description?: ReactNode;
  /** 1-based step shown in the progress bar. Omit for single screens. */
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  backHref?: string;
  hideBack?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const router = useRouter();
  const backClass =
    "absolute left-3 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 outline-none";
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
        <header className="relative flex h-14 items-center justify-center">
          {hideBack ? null : backHref ? (
            <Link href={backHref} aria-label="Back" className={backClass}>
              <ArrowLeft className="size-5" />
            </Link>
          ) : (
            <button type="button" aria-label="Back" onClick={onBack ?? (() => router.back())} className={backClass}>
              <ArrowLeft className="size-5" />
            </button>
          )}
          <h2 className="text-base font-semibold">{barTitle}</h2>
        </header>
        <Separator />
        {step ? (
          <div
            className="flex gap-2 px-6 pt-3"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={totalSteps}
            aria-valuenow={step}
            aria-label={`Step ${step} of ${totalSteps}`}
          >
            {Array.from({ length: totalSteps }, (_, i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full", i < step ? "bg-fuchsia-300" : "bg-muted")} />
            ))}
          </div>
        ) : null}
        <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
          <Brand />
          <h1 className="mt-6 text-3xl font-bold tracking-tight">{title}</h1>
          {description ? <p className="mt-2 text-base text-muted-foreground">{description}</p> : null}
          <div className="mt-7 flex flex-1 flex-col">{children}</div>
          {footer ? <div className="mt-8 text-center text-sm">{footer}</div> : null}
        </div>
      </div>
    </main>
  );
}
