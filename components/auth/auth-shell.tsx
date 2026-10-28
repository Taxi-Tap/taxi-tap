import type { ReactNode } from "react";
import { Brand } from "@/components/auth/brand";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10">
      <section className="flex w-full max-w-md flex-col">
        <Brand />
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
            {title}
          </h1>
          <p className="mt-2 text-base leading-6 text-neutral-600">
            {description}
          </p>
          <div className="mt-7">{children}</div>
        </div>
      </section>
    </main>
  );
}
