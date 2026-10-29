const TZ = "Africa/Johannesburg";

/** 36800 -> "R 368.00" (the spacing used in the designs). */
export function rands(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}R ${Math.floor(abs / 100).toLocaleString("en-ZA").replace(/ /g, " ")}.${String(abs % 100).padStart(2, "0")}`;
}

/** "Today", "Yesterday" or "26 Oct 2026" for grouping history. */
export function dayLabel(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const day = (x: Date) => x.toLocaleDateString("en-CA", { timeZone: TZ });
  const diff = Math.round((Date.parse(day(now)) - Date.parse(day(d))) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TZ });
}

/** "2m ago", "1h ago", else "08:16 20/10". */
export function relativeLabel(iso: string, now = Date.now()): string {
  const mins = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 24 * 60) return `${Math.floor(mins / 60)}h ago`;
  const [y, mo, dd] = new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ }).split("-");
  void y;
  const mm = mo;
  return `${timeLabel(iso)} ${dd}/${mm}`;
}
