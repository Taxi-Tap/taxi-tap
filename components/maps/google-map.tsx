"use client";

import { useEffect, useRef, useState } from "react";
import { MapBackdrop } from "@/components/personal/map-backdrop";
import { cn } from "@/lib/utils";

// Minimal slice of the Maps JavaScript API that we use (no @types/google.maps dependency).
type LatLng = { lat: number; lng: number };
type MapsApi = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
    Marker: new (opts: { map: unknown; position: LatLng; title?: string }) => unknown;
  };
};
declare global {
  interface Window {
    google?: MapsApi;
    __taxiTapMapsReady?: () => void;
  }
}

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
/** Durban, used until we have a real location. */
const DEFAULT_CENTER: LatLng = { lat: -29.8587, lng: 31.0218 };

let loader: Promise<MapsApi> | null = null;

/** Loads the Maps script once for the whole app. */
function loadMaps(): Promise<MapsApi> {
  if (window.google?.maps) return Promise.resolve(window.google);
  loader ??= new Promise<MapsApi>((resolve, reject) => {
    window.__taxiTapMapsReady = () => resolve(window.google as MapsApi);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY ?? "")}&loading=async&callback=__taxiTapMapsReady`;
    script.async = true;
    script.onerror = () => {
      loader = null;
      reject(new Error("Google Maps failed to load"));
    };
    document.head.appendChild(script);
  });
  return loader;
}

/**
 * Google map with a plain street-grid fallback. The fallback shows when no key is set
 * (local development) or the script cannot load (offline, key restricted to other domains).
 */
export function GoogleMap({
  center = DEFAULT_CENTER,
  zoom = 14,
  marker,
  className,
}: {
  center?: LatLng;
  zoom?: number;
  marker?: LatLng;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!KEY);

  useEffect(() => {
    if (!KEY || !el.current) return;
    let cancelled = false;
    loadMaps()
      .then((api) => {
        if (cancelled || !el.current) return;
        const map = new api.maps.Map(el.current, {
          center,
          zoom,
          disableDefaultUI: true,
          clickableIcons: false,
          gestureHandling: "greedy",
        });
        if (marker) new api.maps.Marker({ map, position: marker });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [center, zoom, marker]);

  if (failed) return <MapBackdrop className={className} />;
  return <div ref={el} role="application" aria-label="Map" className={cn("h-full w-full bg-neutral-200", className)} />;
}
