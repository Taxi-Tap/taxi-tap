// Success / failure feedback for the reader screens (TAX-52): a short tone and a vibration.
// Colour and the reason text are shown by the screens themselves.

let ctx: AudioContext | null = null;

function beep(freq: number, start: number, length: number, audio: AudioContext) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = freq;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.0001, audio.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(0.25, audio.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + length);
  osc.connect(gain).connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + length + 0.05);
}

/** Two rising tones for success, one low tone for failure. Silent if the browser blocks audio. */
export function playResult(ok: boolean) {
  try {
    if (typeof window === "undefined") return;
    ctx ??= new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") void ctx.resume();
    if (ok) {
      beep(880, 0, 0.12, ctx);
      beep(1320, 0.14, 0.18, ctx);
    } else {
      beep(220, 0, 0.35, ctx);
    }
    if (navigator.vibrate) navigator.vibrate(ok ? 80 : [120, 60, 120]);
  } catch {
    // Feedback is a nicety; never block a payment on it.
  }
}
