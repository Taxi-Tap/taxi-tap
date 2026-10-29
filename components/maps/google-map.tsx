"use client";

import { useEffect, useRef, useState } from "react";
import { MapBackdrop } from "@/components/personal/map-backdrop";
import { cn } from "@/lib/utils";

// Minimal slice of the Maps JavaScript API that we use (no @types/google.maps dependency).
type LatLng = { lat: number; lng: number };
type MapsApi = {
  maps: {
    SymbolPath: { CIRCLE: number };
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => unknown;
    Marker: new (opts: { map: unknown; position: LatLng; title?: string; icon?: unknown }) => unknown;
    LatLngBounds: new () => { extend(p: LatLng): void };
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
export type Pin = LatLng & { id: string; title?: string };

/** Purple dots over the street grid, placed by their position inside the pins bounding box. */
function FallbackWithPins({ pins, className }: { pins: Pin[]; className?: string }) {
  const lats = pins.map((p) => p.lat);
  const lngs = pins.map((p) => p.lng);
  const [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const pos = (v: number, min: number, max: number) => (max === min ? 50 : 8 + ((v - min) / (max - min)) * 84);
  return (
    <div className={cn("relative h-full w-full", className)}>
      <MapBackdrop />
      {pins.map((p) => (
        <span
          key={p.id}
          title={p.title}
          role="img"
          aria-label={p.title ?? "Pin"}
          className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-fuchsia-600 shadow"
          style={{ left: `${pos(p.lng, minLng, maxLng)}%`, top: `${100 - pos(p.lat, minLat, maxLat)}%` }}
        />
      ))}
    </div>
  );
}

export function GoogleMap({
  center = DEFAULT_CENTER,
  zoom = 14,
  marker,
  pins,
  className,
}: {
  center?: LatLng;
  zoom?: number;
  marker?: LatLng;
  /** Purple pins, e.g. vehicles and stalls on the owner map. The map fits them all. */
  pins?: Pin[];
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
        if (pins?.length) {
          const bounds = new api.maps.LatLngBounds();
          for (const p of pins) {
            bounds.extend(p);
            new api.maps.Marker({
              map,
              position: p,
              title: p.title,
              icon: { path: api.maps.SymbolPath.CIRCLE, scale: 8, fillColor: "#c026d3", fillOpacity: 1, strokeColor: "#ffffff", strokeWeight: 2 },
            });
          }
          (map as { fitBounds(b: unknown, padding?: number): void }).fitBounds(bounds, 48);
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [center, zoom, marker, pins]);

  if (failed) return pins?.length ? <FallbackWithPins pins={pins} className={className} /> : <MapBackdrop className={className} />;
  return <div ref={el} role="application" aria-label="Map" className={cn("h-full w-full bg-neutral-200", className)} />;
}
