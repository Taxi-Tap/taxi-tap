"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/server/auth-actions";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSignOut() {
    setBusy(true);
    setError("");
    try {
      const result = await signOut();
      if (!result.ok) {
        setError("We could not sign you out. Please try again.");
        return;
      }
      router.replace("/sign-in");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-8">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={busy}
        className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 font-semibold text-neutral-950 hover:bg-neutral-50 disabled:opacity-60"
      >
        {busy ? "Signing out…" : "Sign out"}
      </button>
      {error ? <p role="alert" className="mt-2 text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
