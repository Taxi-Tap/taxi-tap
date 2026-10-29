"use client";

import { useEffect } from "react";
import { markNotificationsRead } from "@/server/notifications";

/** Marks everything read a moment after the list has been shown, so the dots are visible once. */
export function MarkRead() {
  useEffect(() => {
    const t = setTimeout(() => void markNotificationsRead(), 1500);
    return () => clearTimeout(t);
  }, []);
  return null;
}
