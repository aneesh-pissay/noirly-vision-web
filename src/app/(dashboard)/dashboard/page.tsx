import { redirect } from "next/navigation";
import { DashboardOverview } from "@/features/dashboard/components/dashboard-overview";
import { getDashboardPageData } from "@/features/dashboard/actions/dashboard.actions";
import { getUserSettingsForClient } from "@/features/settings/actions/settings.actions";
import type { StartupPage } from "@/lib/settings/constants";

const STARTUP_ROUTES: Record<Exclude<StartupPage, "dashboard">, string> = {
  vision: "/dashboard/vision",
  execution: "/dashboard/execution",
  focus: "/dashboard/focus",
};

export default async function DashboardPage() {
  const settings = await getUserSettingsForClient();

  if (settings.startupPage !== "dashboard") {
    redirect(STARTUP_ROUTES[settings.startupPage]);
  }

  const data = await getDashboardPageData();

  return <DashboardOverview data={data} />;
}
