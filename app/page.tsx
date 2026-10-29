import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BusFront,
  CircleDollarSign,
  LayoutDashboard,
  ShieldCheck,
  Store,
  WalletCards,
} from "lucide-react";

const destinations = [
  {
    href: "/wallet",
    eyebrow: "For passengers",
    title: "My wallet",
    description: "View your customer wallet and explore the fare payment experience.",
    icon: WalletCards,
    number: "01",
  },
  {
    href: "/trip",
    eyebrow: "For drivers",
    title: "Record a trip",
    description: "Explore the driver reader journey for collecting taxi fares.",
    icon: BusFront,
    number: "02",
  },
  {
    href: "/request",
    eyebrow: "For merchants",
    title: "Request payment",
    description: "See how service providers and informal traders can request payment.",
    icon: Store,
    number: "03",
  },
  {
    href: "/dashboard",
    eyebrow: "For operators",
    title: "Management dashboard",
    description: "Access the owner area for an overview of the service.",
    icon: LayoutDashboard,
    number: "04",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7fa] text-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[430px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100/80 via-[#f5f7fa] to-[#f5f7fa]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-8 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between border-b border-slate-200/80 py-5 sm:py-6">
          <Link href="/" className="group inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-4">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[#102a43] text-white shadow-sm transition-transform group-hover:-translate-y-0.5">
              <BusFront aria-hidden="true" className="size-5" strokeWidth={1.8} />
            </span>
            <span className="flex flex-col">
              <span className="text-lg font-semibold tracking-tight text-[#102a43]">Taxi Tap</span>
              <span className="text-xs font-medium tracking-wide text-slate-500">MOBILITY PAYMENTS</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs font-medium text-slate-600 sm:inline-flex">
              <span className="size-2 rounded-full bg-amber-500" />
              Demo environment
            </span>
            <Link
              href="/sign-in"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#102a43] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#173f5f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
            >
              Sign in <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </header>

        <section className="grid flex-1 content-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-3.5 py-2 text-xs font-semibold tracking-wide text-sky-900 shadow-sm">
              <CircleDollarSign aria-hidden="true" className="size-4" />
              ONE WALLET. EVERYDAY JOURNEYS.
            </div>

            <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-[#102a43] sm:text-5xl lg:text-6xl">
              Payments that move with you.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              A connected wallet experience for minibus taxi fares, local service providers and informal traders — designed around the way people move and do business.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/sign-in"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#087e8b] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#066873] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#087e8b] focus-visible:ring-offset-2"
              >
                Get started <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a
                href="#services"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2"
              >
                Explore the demo
              </a>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-sm leading-6 text-amber-950 sm:max-w-lg">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-700" />
              <p><span className="font-semibold">Demo mode:</span> all funds are simulated. This environment does not process real payments.</p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-sky-100/70 via-white/20 to-teal-100/70 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-white p-5 shadow-[0_24px_70px_-35px_rgba(16,42,67,0.35)] sm:p-7">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">The Taxi Tap ecosystem</p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#102a43] sm:text-2xl">One simple experience</h2>
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-[#087e8b]">
                  <WalletCards aria-hidden="true" className="size-5" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-5 sm:gap-4">
                <div className="rounded-2xl bg-[#102a43] p-4 text-white sm:p-5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-white/10">
                    <BusFront aria-hidden="true" className="size-4" />
                  </span>
                  <p className="mt-4 text-sm font-semibold">Taxi journeys</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">Fare payment experience</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
                    <Store aria-hidden="true" className="size-4" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-slate-900">Local business</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Merchant payments</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
                    <WalletCards aria-hidden="true" className="size-4" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-slate-900">Digital wallet</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">A connected wallet view</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-800">
                    <LayoutDashboard aria-hidden="true" className="size-4" />
                  </span>
                  <p className="mt-4 text-sm font-semibold text-slate-900">Operations</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Management tools</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm">
                  <ShieldCheck aria-hidden="true" className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Built around everyday needs</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">A shared experience for passengers, drivers and merchants.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="pb-12 sm:pb-16">
          <div className="mb-5 flex flex-col gap-2 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-[#087e8b]">EXPLORE TAXI TAP</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#102a43] sm:text-3xl">Choose your experience</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Select an area to explore the current prototype. Some features are still under development.</p>
            </div>
            <span className="text-xs font-medium text-slate-500">Prototype navigation</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {destinations.map((destination) => {
              const Icon = destination.icon;
              return (
                <Link
                  key={destination.href}
                  href={destination.href}
                  className="group flex min-h-48 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_16px_35px_-24px_rgba(16,42,67,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700 focus-visible:ring-offset-2 sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-[#102a43] transition-colors group-hover:bg-teal-50 group-hover:text-[#087e8b]">
                      <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                    </span>
                    <span className="text-xs font-semibold tracking-widest text-slate-400">{destination.number}</span>
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#087e8b]">{destination.eyebrow}</p>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-900">{destination.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{destination.description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#102a43]">
                    Open section <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-slate-200/80 py-5 text-xs leading-5 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Taxi Tap. Prototype interface.</p>
          <p>Designed for everyday mobility and local commerce.</p>
        </footer>
      </div>
    </main>
  );
}
