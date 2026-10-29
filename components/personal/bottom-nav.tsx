"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, House, Menu, ScanLine, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/home", label: "Home", icon: House },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/pay", label: "Pay", icon: ScanLine },
  { href: "/history", label: "History", icon: History },
  { href: "/account", label: "Menu", icon: Menu },
] as const;

/** Bottom tab bar for the personal account. Hidden during the payment flow and on receipts. */
export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/pay") || /^\/history\/.+/.test(pathname)) return null;

  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t bg-background">
      <ul className="mx-auto flex max-w-md">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
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
