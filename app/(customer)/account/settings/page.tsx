import { AppHeader } from "@/components/personal/app-header";
import { SettingsPanel } from "@/components/personal/settings-panel";
import { getAccount } from "@/server/account";

export default async function SettingsPage() {
  const a = await getAccount();
  return (
    <main>
      <AppHeader title="Settings" backHref="/account" />
      <SettingsPanel smsAlerts={a.smsAlerts} promotions={a.promotions} language={a.language} twoFactorEnabled={a.twoFactorEnabled} />
    </main>
  );
}
