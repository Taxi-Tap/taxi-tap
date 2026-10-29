"use client";

import { Building2, Menu, TriangleAlert } from "lucide-react";
import { TabBar } from "@/components/work/tab-bar";

export function AdminNav() {
  return (
    <TabBar
      tabs={[
        { href: "/admin", label: "Fares", icon: TriangleAlert, match: ["/admin/routes"] },
        { href: "/admin/businesses", label: "Businesses", icon: Building2 },
        { href: "/admin/menu", label: "Menu", icon: Menu },
      ]}
    />
  );
}
