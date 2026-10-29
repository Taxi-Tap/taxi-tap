"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BusFront, ChevronRight, LayoutDashboard, LogOut, Store, UserRound, WalletCards } from "lucide-react";

type Role = "customer" | "merchant" | "owner";
type Session = { role: Role; email: string };
const workspaces = {
  customer: [{ href: "/wallet", title: "My wallet", description: "View your balance and taxi fare activity.", icon: WalletCards }, { href: "/pay", title: "Pay a taxi fare", description: "Simulate a QR scan or NFC tap using demo funds.", icon: WalletCards }],
  merchant: [{ href: "/request", title: "Request payment", description: "Request and review customer payments.", icon: Store }],
  owner: [{ href: "/dashboard", title: "Association dashboard", description: "Manage association and operations.", icon: LayoutDashboard }, { href: "/trip", title: "Driver trip reader", description: "Explore trip and fare recording.", icon: BusFront }],
};

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("taxi-tap-demo-session");
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch { /* Keep the signed-in greeting unavailable if storage is blocked. */ }
  }, []);
  const role = session?.role ?? "customer";
  const roleName = role === "owner" ? "Taxi owner" : role === "merchant" ? "Merchant" : "Customer";
  function signOut() {
    localStorage.removeItem("taxi-tap-demo-session");
    window.location.assign("/sign-in");
  }
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-lg bg-[#102a43] text-white"><BusFront className="size-5" /></span><span className="text-lg font-semibold tracking-tight text-[#102a43]">Taxi Tap</span></div>
          <div className="flex items-center gap-2">
            <Link href="/profile" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium hover:bg-slate-50"><UserRound className="size-4" /><span className="hidden sm:inline">Profile</span></Link>
            <button onClick={signOut} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#102a43] px-3 text-sm font-medium text-white hover:bg-[#1b4260]"><LogOut className="size-4" /><span>Sign out</span></button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-sm font-medium text-teal-700">YOUR WORKSPACE</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Welcome to Taxi Tap</h1>
        <p className="mt-2 text-sm text-slate-600">{session?.email ? `Signed in as ${session.email} · ${roleName}` : `Your ${roleName.toLowerCase()} workspace.`} Choose where you want to go.</p>
        <section className="mt-7" aria-labelledby="workspace-heading">
          <h2 id="workspace-heading" className="mb-3 text-sm font-semibold text-slate-800">Your tools</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {workspaces[role].map((item, index) => { const Icon = item.icon; return <Link key={item.href} href={item.href} className={`group flex min-h-[84px] items-center gap-4 px-4 py-4 hover:bg-slate-50 sm:px-5 ${index ? "border-t border-slate-100" : ""}`}><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#102a43] group-hover:bg-teal-50 group-hover:text-teal-800"><Icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-sm text-slate-500">{item.description}</span></span><ChevronRight className="size-5 text-slate-400" /></Link>; })}
          </div>
        </section>
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"><strong>Demo mode.</strong> All funds are simulated. Real payments are not processed.</div>
      </div>
    </main>
  );
}
