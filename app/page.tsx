import Link from "next/link";
import {
  ArrowUpRight,
  BusFront,
  ChevronRight,
  LayoutDashboard,
  Store,
  WalletCards,
} from "lucide-react";

const sections = [
  {
    href: "/wallet",
    title: "Customer wallet",
    description: "Wallet balance and fare payments",
    icon: WalletCards,
  },
  {
    href: "/trip",
    title: "Driver",
    description: "Record a passenger trip",
    icon: BusFront,
  },
  {
    href: "/request",
    title: "Merchant",
    description: "Request a customer payment",
    icon: Store,
  },
  {
    href: "/dashboard",
    title: "Association & operations",
    description: "Manage services and operations",
    icon: LayoutDashboard,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#102a43] text-white">
              <BusFront aria-hidden="true" className="size-5" />
            </span>
            <span className="text-lg font-semibold tracking-tight text-[#102a43]">Taxi Tap</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-slate-500 sm:inline">Demo environment</span>
            <Link
              href="/sign-in"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#102a43] px-3.5 text-sm font-medium text-white transition-colors hover:bg-[#1b4260] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
            >
              Sign in <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="mb-8">
          <p className="text-sm font-medium text-teal-700">OVERVIEW</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Welcome to Taxi Tap
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Choose a workspace to continue.
          </p>
        </section>

        <section aria-labelledby="workspace-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="workspace-heading" className="text-sm font-semibold text-slate-800">
              Workspaces
            </h2>
            <span className="text-xs text-slate-500">4 available</span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            {sections.map((section, index) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`group flex min-h-[84px] items-center gap-4 px-4 py-4 transition-colors hover:bg-slate-50 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-700 sm:px-5 ${index > 0 ? "border-t border-slate-100" : ""}`}
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#102a43] transition-colors group-hover:bg-teal-50 group-hover:text-teal-800">
                    <Icon aria-hidden="true" className="size-5" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{section.title}</span>
                    <span className="mt-1 block text-sm leading-5 text-slate-500">{section.description}</span>
                  </span>
                  <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-700" />
                </Link>
              );
            })}
          </div>
        </section>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <span className="mt-0.5 size-2 shrink-0 rounded-full bg-amber-500" />
          <p className="text-sm leading-5 text-amber-950">
            <span className="font-semibold">Demo mode.</span> All funds are simulated. Real payments are not processed.
          </p>
        </div>

        <footer className="mt-10 border-t border-slate-200 pt-4 text-xs text-slate-500">
          Taxi Tap · Application prototype
        </footer>
      </div>
    </main>
  );
}
