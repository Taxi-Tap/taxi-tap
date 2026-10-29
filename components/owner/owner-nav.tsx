"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Menu, MapPin, TriangleAlert, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/map", label: "Map", icon: MapPin },
  { href: "/team", label: "Team", icon: UsersRound },
  { href: "/fares", label: "Fares", icon: TriangleAlert },
  { href: "/menu", label: "Menu", icon: Menu },
] as const;

/** Bottom tab bar for the owner account. */
export function OwnerNav() {
  const pathname = usePathname();
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
