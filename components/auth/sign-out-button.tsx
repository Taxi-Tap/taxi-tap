"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { signOut } from "@/server/auth-actions";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  variant = "outline",
  className,
}: {
  variant?: "outline" | "default" | "ghost";
  className?: string;
}) {
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
    <div className={className}>
      <Button type="button" variant={variant} onClick={handleSignOut} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" /> : <LogOut />}
        {busy ? "Signing out…" : "Sign out"}
      </Button>
      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
