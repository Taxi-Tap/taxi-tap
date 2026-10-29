import { Suspense } from "react";
import Link from "next/link";
import {
  BusFront,
  ChevronRight,
  History,
  LayoutDashboard,
  Map,
  QrCode,
  ShieldCheck,
  Store,
  UserRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { LandingPage } from "@/components/landing-page";
import { LoadingScreen } from "@/components/auth/loading-screen";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSignedInProfile } from "@/server/signup";
import type { AppRole } from "@/lib/role-routing";

type Tool = { href: string; title: string; description: string; icon: LucideIcon };

const ROLE_LABEL: Record<AppRole, string> = {
  customer: "Customer",
  driver: "Driver",
  merchant_staff: "Merchant",
  owner: "Taxi owner",
  association_admin: "Association admin",
};

const TOOLS: Record<AppRole, Tool[]> = {
  customer: [
    { href: "/home", title: "Home", description: "Find a taxi or shop and pay.", icon: Map },
    { href: "/wallet", title: "My wallet", description: "View your balance and recharge.", icon: WalletCards },
    { href: "/pay", title: "Pay", description: "Tap or scan to pay a fare.", icon: QrCode },
    { href: "/history", title: "History", description: "See your past payments.", icon: History },
  ],
  driver: [
    { href: "/trip", title: "Driver trip reader", description: "Start a trip and record fares.", icon: BusFront },
    { href: "/scan", title: "Scan a passenger", description: "Charge a fare by QR or NFC.", icon: QrCode },
  ],
  merchant_staff: [
    { href: "/request", title: "Request payment", description: "Request and review customer payments.", icon: Store },
    { href: "/merchant/scan", title: "Scan a customer", description: "Take a payment from a customer code.", icon: QrCode },
  ],
  owner: [
    { href: "/dashboard", title: "Business dashboard", description: "Takings per taxi and driver.", icon: LayoutDashboard },
    { href: "/map", title: "Route map", description: "See routes and payment pins.", icon: Map },
  ],
  association_admin: [
    { href: "/admin", title: "Association admin", description: "Manage the association and its members.", icon: ShieldCheck },
  ],
};

// Signed-out visitors get the public landing page; signed-in users get their workspace.
export default function Home() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading…" />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const profile = await getSignedInProfile();
  if (!profile) return <LandingPage />;

  const tools = TOOLS[profile.role];
  return (
    <main className="min-h-dvh bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="flex size-9 items-center justify-center rounded-full bg-fuchsia-600 text-white">
              <BusFront className="size-5" aria-hidden="true" />
            </span>
            Taxi Tap
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-muted"
            >
              <UserRound className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <SignOutButton variant="default" />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <Badge variant="secondary">{ROLE_LABEL[profile.role]}</Badge>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Welcome, {profile.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Choose where you want to go.</p>
        <Card className="mt-6 py-0">
          <CardContent className="p-0">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <div key={tool.href}>
                  {i > 0 ? <Separator /> : null}
                  <Link href={tool.href} className="group flex items-center gap-4 px-4 py-4 hover:bg-muted/50 sm:px-5">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-fuchsia-100">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold">{tool.title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{tool.description}</span>
                    </span>
                    <ChevronRight className="size-5 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Demo mode.</strong> All funds are simulated. Real payments are not processed.
        </p>
      </div>
    </main>
  );
}
