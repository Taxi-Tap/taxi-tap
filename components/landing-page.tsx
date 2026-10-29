"use client";

import Link from "next/link";
import { useState } from "react";
import { HandCoins, Menu, ScanLine, Wallet, X, HandHelping } from "lucide-react";

const steps = [
  { icon: Wallet, title: "Top up your wallet", description: "Add funds once and use them for every ride and every stall. In this demo, top-ups are simulated." },
  { icon: ScanLine, title: "Show your QR code", description: "Open your wallet and show your QR code, or tap with NFC. The driver or trader scans it." },
  { icon: HandCoins, title: "You're paid up", description: "The fare goes straight to the owner's business. No change, no counting." },
];

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#about", label: "About us" },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <HandHelping className="size-7" aria-hidden /> Taxi Tap
    </span>
  );
}

export function LandingPage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white font-[family-name:var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif] text-neutral-950">
      <header className="relative border-b border-white/20 bg-black text-white">
        <div className="mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
          <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"} className="-ml-2 inline-flex size-10 items-center justify-center rounded-lg hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 justify-self-start">
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
          <Logo className="text-base" />
          <Link href="/sign-in" className="justify-self-end rounded-full bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300">Sign in</Link>
        </div>
        {open && (
          <nav aria-label="Main" className="absolute inset-x-0 top-full z-20 border-b border-white/10 bg-black px-4 pb-3 sm:px-6">
            <ul className="mx-auto max-w-6xl">
              {links.map((link) => (
                <li key={link.href}><a href={link.href} onClick={() => setOpen(false)} className="block py-3 text-sm font-medium text-white/90 hover:text-white">{link.label}</a></li>
              ))}
            </ul>
          </nav>
        )}
      </header>

      <section className="bg-black px-4 pb-6 pt-11 sm:px-6">
        <div className="relative mx-auto flex min-h-[720px] max-w-6xl flex-col justify-between overflow-hidden rounded-3xl bg-cover bg-center p-7 text-white sm:min-h-[640px] sm:p-12" style={{ backgroundImage: "url(/hero-bg.png)" }}>
          <div>
            <Logo className="text-3xl" />
            <h1 className="mt-24 text-4xl font-semibold tracking-tight sm:text-5xl">Tap in. Ride on.</h1>
            <p className="mt-4 max-w-xs text-sm leading-5 sm:max-w-md sm:text-base">One wallet for your taxi fare and the stalls at the rank. Show your QR code, the driver scans it, and you&apos;re paid up. No change, no counting.</p>
          </div>
          <div className="mt-24 max-w-md">
            <p className="text-base font-medium">Create wallet for</p>
            <div className="mt-3 grid gap-3">
              <Link href="/sign-up?type=personal" className="flex h-12 items-center justify-center rounded-full bg-white text-sm font-semibold text-black hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-fuchsia-700">Personal</Link>
              <Link href="/sign-up?type=business" className="flex h-12 items-center justify-center rounded-full border-2 border-white/80 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-fuchsia-700">Business</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-4 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="px-4 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-wide text-fuchsia-600">How it works</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Pay your fare in three steps.</h2>
          </div>
          <ol className="mt-6 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="min-h-[158px] w-[164px] shrink-0 snap-start rounded-xl bg-fuchsia-400/70 p-4 text-white sm:w-auto">
                  <span className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-fuchsia-700 text-xs font-semibold">{index + 1}</span><Icon className="size-4" aria-hidden /></span>
                  <h3 className="mt-3 text-base leading-5">{step.title}</h3>
                  <p className="mt-5 text-xs leading-4 text-white/90">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section id="about" className="scroll-mt-4 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-medium text-fuchsia-600">About us</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">The story</h2>
          <div className="mt-4 max-w-2xl space-y-5 text-xs leading-4 text-neutral-500 sm:text-sm sm:leading-6">
            <p>Taxi Tap started as our 2026 capstone project at CTU Durban. Minibus taxis move most of the people in our city, yet almost every fare is still paid in cash. That means counting change in a moving taxi, owners who can&apos;t see their real takings, and traders who lose a sale when a customer has no cash.</p>
            <p>We asked a simple question: what if the fare, and the stall at the rank, could all be paid from one wallet on the phone you already have? Taxi Tap is our answer, designed around how taxis really run: fares set at boarding, flat or by destination, with the money going to the owner&apos;s business.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
