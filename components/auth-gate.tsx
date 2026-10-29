"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Role = "customer" | "merchant" | "owner";
type Session = { role: Role; email: string };

const landing: Record<Role, string> = {
  customer: "/",
  merchant: "/",
  owner: "/",
};

function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem("taxi-tap-demo-session");
    if (!raw) return null;
    const value = JSON.parse(raw) as Session;
    return ["customer", "merchant", "owner"].includes(value.role) && value.email ? value : null;
  } catch {
    return null;
  }
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const session = readSession();
    if (pathname === "/sign-in") {
      if (session) router.replace(landing[session.role]);
      else setAllowed(true);
      return;
    }
    if (!session) {
      router.replace("/sign-in");
      return;
    }

    const expectedRole =
      pathname.startsWith("/wallet") || pathname.startsWith("/pay") ? "customer" :
      pathname.startsWith("/request") ? "merchant" :
      pathname.startsWith("/dashboard") || pathname.startsWith("/trip") ? "owner" :
      pathname.startsWith("/profile") ? null : null;

    if (expectedRole && expectedRole !== session.role) {
      router.replace(landing[session.role]);
      return;
    }
    setAllowed(true);
  }, [pathname, router]);

  if (!allowed) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">Loading Taxi Tap…</main>;
  }

  return <>{children}</>;
}
