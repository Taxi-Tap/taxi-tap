"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Browser-only demo session is hydrated from localStorage after mount. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LogOut, UserRound } from "lucide-react";

type Session = { role: "customer" | "merchant" | "owner"; email: string };
const roleLabel = (role: Session["role"]) => role === "owner" ? "Taxi owner" : role === "merchant" ? "Merchant" : "Customer";

export default function ProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("taxi-tap-demo-session");
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch { /* Storage may be disabled. */ }
  }, []);
  function signOut() {
    localStorage.removeItem("taxi-tap-demo-session");
    window.location.assign("/sign-in");
  }
  return <main className="min-h-screen bg-slate-50 text-slate-900">
    <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-3xl items-center px-4 sm:px-6"><Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="size-4" /> Back to home</Link></div></header>
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="text-sm font-medium text-teal-700">ACCOUNT</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Profile</h1><p className="mt-2 text-sm text-slate-600">Your current Taxi Tap demo session.</p>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-700"><UserRound className="size-6" /></span><div><h2 className="font-semibold">{session?.email || "Demo user"}</h2><p className="mt-1 text-sm text-slate-500">{session ? roleLabel(session.role) : "Session details unavailable"}</p></div></div>
        <p className="mt-5 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Prototype profile. Sign-in details are stored only in this browser and are not verified by a server.</p>
        <button onClick={signOut} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#102a43] px-4 text-sm font-semibold text-white hover:bg-[#1b4260]"><LogOut className="size-4" /> Sign out</button>
      </section>
    </div>
  </main>;
}
