"use client";

import { BusFront, House, Menu, Route as RouteIcon, WalletCards } from "lucide-react";
import { TabBar } from "@/components/work/tab-bar";

export function DriverNav() {
  return (
    <TabBar
      tabs={[
        { href: "/trip", label: "Home", icon: House },
        { href: "/shift", label: "Shift", icon: RouteIcon },
        { href: "/scan", label: "Reader", icon: BusFront },
        { href: "/takings", label: "Takings", icon: WalletCards },
        { href: "/driver", label: "Menu", icon: Menu },
      ]}
    />
  );
}
