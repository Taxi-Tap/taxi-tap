import { cn } from "@/lib/utils";

/**
 * Stand-in for the Google map (the maps key and RouteMap belong to TAX-68).
 * Draws a grey street grid so the Home and Receipt screens match the designs.
 */
export function MapBackdrop({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 600"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full bg-neutral-200", className)}
    >
      <rect width="400" height="600" fill="#e5e5e5" />
      <path d="M-20 140 C 80 60, 160 220, 260 170 S 380 60, 430 120" stroke="#d4d4d4" strokeWidth="46" fill="none" />
      <g stroke="#fff" strokeLinecap="round" fill="none">
        <path d="M0 80 L400 140" strokeWidth="8" />
        <path d="M0 300 C 120 240, 240 360, 400 280" strokeWidth="10" />
        <path d="M60 0 L120 600" strokeWidth="8" />
        <path d="M220 0 L180 600" strokeWidth="10" />
        <path d="M330 0 L360 600" strokeWidth="7" />
        <path d="M0 460 L400 420" strokeWidth="8" />
        <path d="M0 540 L400 560" strokeWidth="6" />
        <path d="M0 200 L400 220" strokeWidth="5" />
        <path d="M0 380 L400 360" strokeWidth="5" />
        <circle cx="150" cy="110" r="22" strokeWidth="8" />
      </g>
    </svg>
  );
}
