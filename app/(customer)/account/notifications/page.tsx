import { AppHeader } from "@/components/personal/app-header";
import { MarkRead } from "@/components/personal/mark-read";
import { relativeLabel } from "@/lib/format";
import { listNotifications } from "@/server/notifications";

export default async function NotificationsPage() {
  const items = await listNotifications();
  const hasUnread = items.some((n) => n.unread);
  return (
    <main>
      <AppHeader title="Notifications" backHref="/account" />
      {hasUnread ? <MarkRead /> : null}
      {items.length === 0 ? (
        <p className="m-4 rounded-2xl bg-muted p-4 text-sm text-muted-foreground">No notifications yet.</p>
      ) : (
        <ul className="divide-y px-4">
          {items.map((n) => (
            <li key={n.id} className="py-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-bold">{n.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeLabel(n.createdAt)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">{n.body}</p>
                {n.unread ? <span className="size-3 shrink-0 rounded-full bg-fuchsia-500" role="img" aria-label="Unread" /> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
