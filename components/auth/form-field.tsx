import type { InputHTMLAttributes, ReactNode } from "react";

export function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-neutral-900">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClassName =
  "h-12 w-full rounded-xl border border-neutral-300 bg-white px-3 text-base text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D28D9]";
