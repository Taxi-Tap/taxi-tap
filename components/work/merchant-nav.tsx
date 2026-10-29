"use client";

import { HandCoins, House, Menu, ReceiptText, ScanLine } from "lucide-react";
import { TabBar } from "@/components/work/tab-bar";

export function MerchantNav() {
  return (
    <TabBar
      tabs={[
        { href: "/shop", label: "Home", icon: House },
        { href: "/request", label: "Request", icon: HandCoins },
        { href: "/merchant/scan", label: "Scan", icon: ScanLine },
        { href: "/sales", label: "Sales", icon: ReceiptText },
        { href: "/store", label: "Menu", icon: Menu },
      ]}
    />
  );
}
