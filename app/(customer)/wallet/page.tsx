"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, CheckCircle2, Plus, ShieldCheck, WalletCards } from "lucide-react";

type Activity = { id: number; title: string; detail: string; amount: number; fee: number; timestamp: string };

const STORAGE_KEY = "taxi-tap-demo-wallet-v1";
const money = (value: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
const dateLabel = (date: string) => new Date(date).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" });

function sampleActivity(): Activity[] {
  const now = new Date();
  const at = (daysAgo: number, hour: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
  };
  return [
    { id: 1, title: "Demo wallet top-up", detail: "Simulated credit", amount: 250, fee: 0, timestamp: at(0, 8) },
    { id: 2, title: "Taxi fare", detail: "Example trip · Route A", amount: -18, fee: 1.08, timestamp: at(1, 7) },
    { id: 3, title: "Demo wallet top-up", detail: "Simulated credit", amount: 100, fee: 0, timestamp: at(2, 9) },
    { id: 4, title: "Taxi fare", detail: "Example trip · Route B", amount: -24, fee: 1.44, timestamp: at(3, 17) },
    { id: 5, title: "Taxi fare", detail: "Example trip · Route A", amount: -16, fee: 0.96, timestamp: at(5, 8) },
    { id: 6, title: "Demo wallet top-up", detail: "Simulated credit", amount: 200, fee: 0, timestamp: at(7, 12) },
    { id: 7, title: "Taxi fare", detail: "Example trip · Route C", amount: -22, fee: 1.32, timestamp: at(9, 18) },
    { id: 8, title: "Taxi fare", detail: "Example trip · Route B", amount: -18, fee: 1.08, timestamp: at(12, 7) },
    { id: 9, title: "Taxi fare", detail: "Example trip · Route A", amount: -20, fee: 1.2, timestamp: at(16, 8) },
    { id: 10, title: "Demo wallet top-up", detail: "Simulated credit", amount: 150, fee: 0, timestamp: at(20, 11) },
    { id: 11, title: "Taxi fare", detail: "Example trip · Route C", amount: -15, fee: 0.9, timestamp: at(24, 17) },
    { id: 12, title: "Taxi fare", detail: "Example trip · Route B", amount: -19, fee: 1.14, timestamp: at(28, 7) },
  ].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export default function WalletPage() {
  const [balance, setBalance] = useState(332);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    const today = new Date();
    setCurrentMonth(`${today.getMonth()}-${today.getFullYear()}`);
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { balance?: number; activity?: Activity[] };
        if (typeof parsed.balance === "number" && Array.isArray(parsed.activity)) {
          setBalance(parsed.balance);
          setActivity(parsed.activity);
        } else {
          setActivity(sampleActivity());
        }
      } else {
        const initial = sampleActivity();
        const initialBalance = 332;
        setBalance(initialBalance);
        setActivity(initial);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance: initialBalance, activity: initial }));
      }
    } catch {
      setActivity(sampleActivity());
      setNotice("Your browser storage is unavailable. Changes may not persist after refresh.");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ balance, activity }));
    } catch {
      setNotice("Your browser storage is unavailable. Changes may not persist after refresh.");
    }
  }, [balance, activity, ready]);

  const monthStats = useMemo(() => {
    const [month, year] = currentMonth.split("-").map(Number);
    const thisMonth = activity.filter((item) => {
      const date = new Date(item.timestamp);
      return date.getMonth() === month && date.getFullYear() === year;
    });
    const spent = thisMonth.reduce((sum, item) => sum + (item.amount < 0 ? Math.abs(item.amount) : 0), 0);
    const fees = thisMonth.reduce((sum, item) => sum + item.fee, 0);
    const topUps = thisMonth.reduce((sum, item) => sum + (item.amount > 0 ? item.amount : 0), 0);
    return { spent, fees, topUps };
  }, [activity, currentMonth]);

  function addDemoFunds(amount: number) {
    const transaction: Activity = {
      id: Date.now(),
      title: "Demo wallet top-up",
      detail: "Simulated funds added",
      amount,
      fee: 0,
      timestamp: new Date().toISOString(),
    };
    setBalance((current) => current + amount);
    setActivity((current) => [transaction, ...current]);
    setNotice(`${money(amount)} in simulated funds added. Your demo balance is saved in this browser.`);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft className="size-4" /> <span className="hidden sm:inline">Home</span></Link>
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-[#102a43]"><span className="flex size-8 items-center justify-center rounded-lg bg-[#102a43] text-white"><WalletCards className="size-4" /></span>Taxi Tap</Link>
          <span className="rounded-full bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">Demo mode</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-9">
        <div className="mb-6">
          <p className="text-sm font-medium text-teal-700">CUSTOMER ACCOUNT</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">My wallet</h1>
          <p className="mt-2 text-sm text-slate-600">Your simulated balance and monthly spending at a glance.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-2xl bg-[#102a43] p-5 text-white shadow-sm md:col-span-2 sm:p-7">
            <div className="flex items-start justify-between">
              <div><p className="text-sm text-slate-300">Available balance</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{money(balance)}</h2><p className="mt-2 text-xs text-slate-300">South African rand (ZAR)</p></div>
              <WalletCards className="size-6 text-slate-300" />
            </div>
            <div className="mt-6 flex items-start gap-2 border-t border-white/10 pt-4 text-xs leading-5 text-slate-300"><ShieldCheck className="mt-0.5 size-4 shrink-0" /> Demo funds only. No real money is stored or transferred.</div>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2"><Plus className="size-5 text-teal-700" /><h2 className="font-semibold">Add demo funds</h2></div>
            <p className="mt-2 text-sm text-slate-500">Select an amount to top up.</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[50, 100, 200].map((amount) => <button key={amount} type="button" onClick={() => addDemoFunds(amount)} className="min-h-11 rounded-lg border border-slate-200 px-2 text-sm font-semibold hover:border-teal-600 hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">+R{amount}</button>)}
            </div>
            {notice && <p role="status" className="mt-3 flex gap-2 rounded-lg bg-emerald-50 p-2.5 text-xs leading-5 text-emerald-900"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />{notice}</p>}
          </section>
        </div>

        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Taxi fares this month</p><p className="mt-2 text-xl font-semibold">{money(monthStats.spent)}</p><p className="mt-1 text-xs text-slate-500">Total fare payments</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Taxi Tap company fees</p><p className="mt-2 text-xl font-semibold">{money(monthStats.fees)}</p><p className="mt-1 text-xs text-slate-500">Illustrative 6% fee on sample fares</p></div>
          <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-sm text-slate-500">Top-ups this month</p><p className="mt-2 text-xl font-semibold">{money(monthStats.topUps)}</p><p className="mt-1 text-xs text-slate-500">Simulated credits added</p></div>
        </section>

        <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h2 className="font-semibold">Transaction history</h2><p className="mt-1 text-sm text-slate-500">Demo transactions for the current month, newest first.</p></div>
          <ul className="divide-y divide-slate-100">
            {activity.map((item) => {
              const credit = item.amount > 0;
              return <li key={item.id} className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-6">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${credit ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{credit ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}</span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.detail} · {dateLabel(item.timestamp)}</p>{!credit && <p className="mt-1 text-xs text-slate-500">Illustrative company fee: {money(item.fee)}</p>}</div>
                <p className={`shrink-0 text-sm font-semibold tabular-nums ${credit ? "text-emerald-700" : "text-slate-800"}`}>{credit ? "+" : "−"}{money(Math.abs(item.amount))}</p>
              </li>;
            })}
          </ul>
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500 sm:px-6">Sample transaction history and fee estimates only. The 6% fee is illustrative, not a confirmed Taxi Tap tariff.</div>
        </section>
      </div>
    </main>
  );
}
