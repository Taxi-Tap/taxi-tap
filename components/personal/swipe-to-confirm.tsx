"use client";

import { useRef, useState, type PointerEvent } from "react";
import { ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

const HANDLE = 56;

/**
 * Drag the handle across to confirm. Keyboard and screen-reader users get the
 * same result by focusing the handle and pressing Enter or Space.
 */
export function SwipeToConfirm({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  const track = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const dragging = useRef(false);
  const start = useRef(0);

  const max = () => (track.current?.clientWidth ?? 280) - HANDLE - 4;

  function down(e: PointerEvent<HTMLButtonElement>) {
    if (disabled) return;
    dragging.current = true;
    start.current = e.clientX - x;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent<HTMLButtonElement>) {
    if (!dragging.current) return;
    setX(Math.min(Math.max(e.clientX - start.current, 0), max()));
  }
  function up() {
    if (!dragging.current) return;
    dragging.current = false;
    if (x >= max() * 0.85) {
      setX(max());
      onConfirm();
    } else {
      setX(0);
    }
  }

  return (
    <div
      ref={track}
      className={cn("relative flex h-14 items-center justify-center rounded-full bg-black text-base font-semibold text-white", disabled && "opacity-50")}
    >
      <button
        type="button"
        disabled={disabled}
        aria-label="Swipe to confirm payment"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onConfirm();
          }
        }}
        style={{ transform: `translateX(${x}px)`, width: HANDLE, height: HANDLE - 4 }}
        className="absolute left-0.5 flex touch-none items-center justify-center rounded-full border bg-white text-black outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <ChevronsRight className="size-5" aria-hidden="true" />
      </button>
      <span aria-hidden="true">Swipe to Confirm</span>
    </div>
  );
}
