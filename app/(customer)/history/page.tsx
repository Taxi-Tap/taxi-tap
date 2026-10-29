import { AppHeader } from "@/components/personal/app-header";
import { HistoryList } from "@/components/personal/history-list";
import { listMyTransactions } from "@/server/wallets";

// History: every payment, grouped by day, with Taxi / Stalls / Recharge filters (TAX-39).
export default async function HistoryPage() {
  const transactions = await listMyTransactions();
  return (
    <main>
      <AppHeader title="History" hideBack />
      <HistoryList transactions={transactions} />
    </main>
  );
}
