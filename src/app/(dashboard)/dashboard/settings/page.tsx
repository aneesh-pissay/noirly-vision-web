import { SettingsOverview } from "@/components/dashboard/settings-overview";
import { getSettingsPageData } from "@/features/settings/actions/settings.actions";

export default async function SettingsPage() {
  const data = await getSettingsPageData();
  return <SettingsOverview data={data} />;
}
