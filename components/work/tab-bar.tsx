"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tab = { href: string; label: string; icon: LucideIcon; match?: string[] };

/** Bottom tab bar for the driver and merchant accounts. */
export function TabBar({ tabs, hideOn = [] }: { tabs: Tab[]; hideOn?: string[] }) {
  const pathname = usePathname();
  if (hideOn.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t bg-background">
      <ul className="mx-auto flex max-w-md">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = [href, ...(match ?? [])].some((p) => pathname === p || pathname.startsWith(`${p}/`));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs font-semibold outline-none focus-visible:bg-muted",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-6" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
