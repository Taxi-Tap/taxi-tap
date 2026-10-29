"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, BusFront, Store, WalletCards } from "lucide-react";

const roles = [
  { id: "customer", title: "Customer", description: "Access your wallet and taxi payments.", icon: WalletCards },
  { id: "merchant", title: "Merchant", description: "Request and manage customer payments.", icon: Store },
  { id: "owner", title: "Taxi owner", description: "Manage your association and operations.", icon: BusFront },
] as const;

export default function SignInPage() {
  const [role, setRole] = useState<"customer" | "merchant" | "owner">("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      window.localStorage.setItem("taxi-tap-demo-session", JSON.stringify({ role, email: email.trim() }));
      window.location.assign(role === "customer" ? "/wallet" : role === "merchant" ? "/request" : "/dashboard");
    } catch {
      setNotice("Could not start a demo session in this browser. Please enable browser storage and try again.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6"><Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="size-4" /> Back to home</Link></div></header>
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <section><div className="flex size-12 items-center justify-center rounded-xl bg-[#102a43] text-white"><BusFront className="size-6" /></div><p className="mt-6 text-sm font-semibold tracking-wide text-teal-700">TAXI TAP ACCOUNT</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#102a43] sm:text-4xl">Sign in to continue</h1><p className="mt-3 max-w-md text-sm leading-6 text-slate-600 sm:text-base">Choose your account type, then sign in to access the right workspace.</p><p className="mt-6 text-xs leading-5 text-slate-500">Prototype environment · Simulated funds only</p></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="font-semibold text-slate-950">I am signing in as a</h2>
          <div className="mt-4 grid gap-2">{roles.map((item) => { const Icon = item.icon; const selected = role === item.id; return <button key={item.id} type="button" onClick={() => { setRole(item.id); setNotice(""); }} aria-pressed={selected} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 ${selected ? "border-teal-700 bg-teal-50 ring-1 ring-teal-700" : "border-slate-200 hover:bg-slate-50"}`}><span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${selected ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700"}`}><Icon className="size-5" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{item.description}</span></span><span className={`size-4 rounded-full border ${selected ? "border-[5px] border-teal-700 bg-white" : "border-slate-300"}`} /></button>; })}</div>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div><label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email address</label><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20" /></div>
            <div><label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">Password</label><input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20" /></div>
            <button type="submit" className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#102a43] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#1b4260] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2">Continue as {roles.find((item) => item.id === role)?.title} <ArrowRight className="size-4" /></button>
          </form>
          {notice && <p role="status" className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">{notice}</p>}
          <p className="mt-4 text-center text-xs leading-5 text-slate-500">Demo sign-in only. Authentication is not yet connected; do not use a real password.</p>
        </section>
      </div>
    </main>
  );
}
