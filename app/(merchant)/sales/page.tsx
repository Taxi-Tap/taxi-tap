import { AppHeader } from "@/components/personal/app-header";
import { rands } from "@/lib/format";
import { listSales } from "@/server/merchant";

// Sales: every payment the company has received, newest first, grouped by day.
export default async function SalesPage() {
  const sales = await listSales();
  const groups = new Map<string, typeof sales>();
  for (const s of sales) groups.set(s.day, [...(groups.get(s.day) ?? []), s]);
  return (
    <main>
      <AppHeader title="Sales" hideBack />
      <div className="px-4 pt-4">
        {sales.length === 0 ? (
          <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">No sales yet.</p>
        ) : (
          [...groups.entries()].map(([day, items]) => (
            <section key={day} className="mb-6" aria-label={day}>
              <h2 className="mb-2 text-sm font-bold">{day}</h2>
              <ul className="space-y-2">
                {items.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-3">
                    <span>
                      <span className="block text-sm font-medium">{s.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {s.time} {"·"} {s.by}
                      </span>
                    </span>
                    <span className="text-sm font-bold text-emerald-600">+ {rands(s.amountCents)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
