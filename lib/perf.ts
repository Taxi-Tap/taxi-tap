// Tap-to-confirm timing and payload size (TAX-45), measured in the browser.
// NFR-01 / NFR-02: the code a customer shows should be small and the round trip quick.

export type PayTiming = {
  /** Size of the code the reader submitted, in bytes. */
  payloadBytes: number;
  /** From "code read" to "result on screen", in milliseconds. */
  confirmMs: number;
  at: string;
};

const KEY = "taxi-tap-pay-timings";

export function payloadBytes(text: string) {
  return new TextEncoder().encode(text).length;
}

/** Runs `pay`, records how long it took, and returns both. Keeps the last 50 in localStorage for the test report. */
export async function timed<T>(credential: string, pay: () => Promise<T>): Promise<{ result: T; timing: PayTiming }> {
  const start = performance.now();
  const result = await pay();
  const timing: PayTiming = {
    payloadBytes: payloadBytes(credential),
    confirmMs: Math.round(performance.now() - start),
    at: new Date().toISOString(),
  };
  try {
    const all: PayTiming[] = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    localStorage.setItem(KEY, JSON.stringify([...all, timing].slice(-50)));
  } catch {
    // Storage can be blocked; the timing is still returned to the screen.
  }
  return { result, timing };
}
