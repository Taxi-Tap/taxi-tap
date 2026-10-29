"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { CameraOff } from "lucide-react";

/**
 * Shared camera QR scanner (TAX-43). Opens the rear camera, looks for a QR code about ten times
 * a second and calls `onScan` once with its text. If the camera is missing or blocked it says so,
 * and the screen around it offers the manual code instead.
 */
export function QrScanner({ onScan, active = true }: { onScan: (text: string) => void; active?: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [problem, setProblem] = useState("");
  const done = useRef(false);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!active) return;
    done.current = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setProblem("This browser cannot open the camera. Enter the code instead.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (cancelled || !video.current) return;
        video.current.srcObject = stream;
        await video.current.play();
        timer = setInterval(() => {
          const v = video.current;
          const c = canvas.current;
          if (!v || !c || done.current || v.videoWidth === 0) return;
          const scale = Math.min(1, 480 / v.videoWidth);
          c.width = Math.round(v.videoWidth * scale);
          c.height = Math.round(v.videoHeight * scale);
          const g = c.getContext("2d", { willReadFrequently: true });
          if (!g) return;
          g.drawImage(v, 0, 0, c.width, c.height);
          const img = g.getImageData(0, 0, c.width, c.height);
          const hit = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
          if (hit?.data) {
            done.current = true;
            onScanRef.current(hit.data);
          }
        }, 100);
      } catch {
        setProblem("We could not use the camera. Allow camera access, or enter the code instead.");
      }
    }
    void start();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active]);

  if (problem) {
    return (
      <div role="alert" className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl bg-muted p-6 text-center text-sm">
        <CameraOff className="size-8 text-muted-foreground" aria-hidden="true" />
        {problem}
      </div>
    );
  }
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
      <video ref={video} muted playsInline className="size-full object-cover" aria-label="Camera" />
      <canvas ref={canvas} className="hidden" />
      <div className="pointer-events-none absolute inset-6 rounded-3xl border-2 border-white/80" aria-hidden="true" />
    </div>
  );
}
