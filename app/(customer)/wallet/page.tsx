"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Plus,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

type Activity = {
  id: number;
  title: string;
  detail: string;
  amount: number;
  date: string;
};

const initialActivity: Activity[] = [
  {
    id: 1,
    title: "Welcome demo credit",
    detail: "Simulated wallet credit",
    amount: 250,
    date: "Today",
  },
  {
    id: 2,
    title: "Taxi fare",
    detail: "Example trip payment",
    amount: -18,
    date: "Yesterday",
  },
  {
    id: 3,
    title: "Demo top-up",
    detail: "Simulated wallet credit",
    amount: 100,
    date: "24 Oct 2026",
  },
];

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(amount);

export default function WalletPage() {
  const [balance, setBalance] = useState(332);
  const [activity, setActivity] = useState(initialActivity);
  const [notice, setNotice] = useState("");

  function addDemoFunds(amount: number) {
    setBalance((current) => current + amount);
    setActivity((current) => [
      {
        id: Date.now(),
        title: "Demo top-up",
        detail: "Simulated funds added",
        amount,
        date: "Just now",
      },
      ...current,
    ]);
    setNotice(`${formatMoney(amount)} in simulated funds added to your wallet.`);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
            <ArrowLeft aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-[#102a43]">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#102a43] text-white">
              <WalletCards aria-hidden="true" className="size-4" />
            </span>
            Taxi Tap
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Demo
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-9">
        <div className="mb-6">
          <p className="text-sm font-medium text-teal-700">CUSTOMER WALLET</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">My wallet</h1>
          <p className="mt-2 text-sm text-slate-600">View your balance and try adding simulated funds.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="overflow-hidden rounded-2xl bg-[#102a43] text-white shadow-sm" aria-labelledby="balance-heading">
            <div className="flex items-start justify-between p-5 sm:p-7">
              <div>
                <p className="text-sm font-medium text-slate-300">Available balance</p>
                <h2 id="balance-heading" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {formatMoney(balance)}
                </h2>
                <p className="mt-2 text-xs text-slate-300">South African rand (ZAR)</p>
              </div>
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/10">
                <WalletCards aria-hidden="true" className="size-5" />
              </span>
            </div>
            <div className="border-t border-white/10 bg-white/5 px-5 py-3.5 sm:px-7">
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <ShieldCheck aria-hidden="true" className="size-4 shrink-0" />
                Simulated balance only — no real money is held or transferred.
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="topup-heading">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                <Plus aria-hidden="true" className="size-5" />
              </span>
              <div>
                <h2 id="topup-heading" className="font-semibold text-slate-950">Add demo funds</h2>
                <p className="mt-0.5 text-sm text-slate-500">Choose an amount to test the wallet.</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {[50, 100, 200].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => addDemoFunds(amount)}
                  className="flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800 transition-colors hover:border-teal-600 hover:bg-teal-50 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
                >
                  + {formatMoney(amount).replace(",00", "")}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">This is a local demo interaction. The balance resets when the page is refreshed.</p>
            {notice ? (
              <div role="status" className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>{notice}</span>
              </div>
            ) : null}
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="activity-heading">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 id="activity-heading" className="font-semibold text-slate-950">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-500">Example transactions for demonstration.</p>
            </div>
            <span className="hidden items-center gap-1.5 text-xs text-slate-500 sm:inline-flex">
              <Clock3 aria-hidden="true" className="size-3.5" />
              Latest first
            </span>
          </div>

          <ul className="divide-y divide-slate-100">
            {activity.map((item) => {
              const isCredit = item.amount > 0;
              return (
                <li key={item.id} className="flex items-center gap-3 px-5 py-4 sm:gap-4 sm:px-6">
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${isCredit ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {isCredit ? (
                      <ArrowDownLeft aria-hidden="true" className="size-5" />
                    ) : (
                      <ArrowUpRight aria-hidden="true" className="size-5" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.detail} · {item.date}</p>
                  </div>
                  <p className={`shrink-0 text-sm font-semibold tabular-nums ${isCredit ? "text-emerald-700" : "text-slate-800"}`}>
                    {isCredit ? "+" : "−"}{formatMoney(Math.abs(item.amount))}
                  </p>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500 sm:px-6">
            Transaction history shown here is sample data, not a real financial record.
          </div>
        </section>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Taxi Tap prototype · Simulated funds only · No real payments processed
        </p>
      </div>
    </main>
  );
}
